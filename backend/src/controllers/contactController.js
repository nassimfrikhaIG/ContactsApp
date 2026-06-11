const Contact = require('../models/Contact');
const Activity = require('../models/Activity');
const { createObjectCsvWriter } = require('csv-writer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// @desc    Get all contacts
// @route   GET /api/contacts
const getContacts = async (req, res, next) => {
  try {
    const {
      search, page = 1, limit = 20, sort = '-createdAt',
      group, tag, isFavorite, company
    } = req.query;

    const query = { owner: req.user._id };

    if (search) {
      query.$text = { $search: search };
    }
    if (group) query.groups = group;
    if (tag) query.tags = tag;
    if (isFavorite === 'true') query.isFavorite = true;
    if (company) query.company = new RegExp(company, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Contact.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact
// @route   GET /api/contacts/:id
const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, owner: req.user._id });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.json({ success: true, data: { contact } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create contact
// @route   POST /api/contacts
const createContact = async (req, res, next) => {
  try {
    const contact = await Contact.create({ ...req.body, owner: req.user._id });

    await Activity.create({
      user: req.user._id,
      contact: contact._id,
      action: 'created',
      description: `Created contact ${contact.fullName}`
    });

    res.status(201).json({ success: true, message: 'Contact created', data: { contact } });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
const updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await Activity.create({
      user: req.user._id,
      contact: contact._id,
      action: 'updated',
      description: `Updated contact ${contact.fullName}`
    });

    res.json({ success: true, message: 'Contact updated', data: { contact } });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    await Activity.create({
      user: req.user._id,
      action: 'deleted',
      description: `Deleted contact ${contact.fullName}`
    });

    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete multiple contacts
// @route   DELETE /api/contacts/bulk
const bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) {
      return res.status(400).json({ success: false, message: 'No IDs provided' });
    }

    const result = await Contact.deleteMany({ _id: { $in: ids }, owner: req.user._id });

    await Activity.create({
      user: req.user._id,
      action: 'deleted',
      description: `Bulk deleted ${result.deletedCount} contacts`
    });

    res.json({ success: true, message: `${result.deletedCount} contacts deleted` });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite
// @route   PATCH /api/contacts/:id/favorite
const toggleFavorite = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, owner: req.user._id });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    contact.isFavorite = !contact.isFavorite;
    await contact.save();

    await Activity.create({
      user: req.user._id,
      contact: contact._id,
      action: contact.isFavorite ? 'favorited' : 'unfavorited',
      description: `${contact.isFavorite ? 'Added' : 'Removed'} ${contact.fullName} ${contact.isFavorite ? 'to' : 'from'} favorites`
    });

    res.json({ success: true, data: { isFavorite: contact.isFavorite } });
  } catch (error) {
    next(error);
  }
};

// @desc    Export contacts to CSV
// @route   GET /api/contacts/export
const exportCSV = async (req, res, next) => {
  try {
    const contacts = await Contact.find({ owner: req.user._id }).lean();

    const exportPath = path.join('/tmp', `contacts_export_${Date.now()}.csv`);

    const csvWriter = createObjectCsvWriter({
      path: exportPath,
      header: [
        { id: 'firstName', title: 'First Name' },
        { id: 'lastName', title: 'Last Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'mobile', title: 'Mobile' },
        { id: 'company', title: 'Company' },
        { id: 'jobTitle', title: 'Job Title' },
        { id: 'department', title: 'Department' },
        { id: 'notes', title: 'Notes' },
        { id: 'tags', title: 'Tags' },
        { id: 'groups', title: 'Groups' }
      ]
    });

    const records = contacts.map(c => ({
      ...c,
      tags: (c.tags || []).join(';'),
      groups: (c.groups || []).join(';')
    }));

    await csvWriter.writeRecords(records);

    await Activity.create({
      user: req.user._id,
      action: 'exported',
      description: `Exported ${contacts.length} contacts to CSV`
    });

    res.download(exportPath, 'contacts.csv', (err) => {
      fs.unlink(exportPath, () => {});
      if (err) next(err);
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import contacts from CSV
// @route   POST /api/contacts/import
const importCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const contacts = [];
    const errors = [];
    let row = 0;

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          row++;
          const firstName = data['First Name'] || data['firstName'] || data['first_name'];
          const lastName = data['Last Name'] || data['lastName'] || data['last_name'];

          if (!firstName || !lastName) {
            errors.push(`Row ${row}: First Name and Last Name are required`);
            return;
          }

          contacts.push({
            owner: req.user._id,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: data['Email'] || data['email'] || null,
            phone: data['Phone'] || data['phone'] || null,
            mobile: data['Mobile'] || data['mobile'] || null,
            company: data['Company'] || data['company'] || null,
            jobTitle: data['Job Title'] || data['jobTitle'] || null,
            department: data['Department'] || data['department'] || null,
            notes: data['Notes'] || data['notes'] || null,
            tags: data['Tags'] ? data['Tags'].split(';').map(t => t.trim()).filter(Boolean) : [],
            groups: data['Groups'] ? data['Groups'].split(';').map(g => g.trim()).filter(Boolean) : [],
            source: 'import'
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    let imported = 0;
    if (contacts.length > 0) {
      const result = await Contact.insertMany(contacts, { ordered: false });
      imported = result.length;
    }

    fs.unlink(req.file.path, () => {});

    await Activity.create({
      user: req.user._id,
      action: 'imported',
      description: `Imported ${imported} contacts from CSV`,
      metadata: { total: row, imported, errors: errors.length }
    });

    res.json({
      success: true,
      message: `Successfully imported ${imported} contacts`,
      data: { imported, total: row, errors }
    });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(error);
  }
};

// @desc    Get contact statistics
// @route   GET /api/contacts/stats
const getStats = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const [
      total,
      favorites,
      withEmail,
      withPhone,
      bySource,
      topCompanies,
      recentActivity
    ] = await Promise.all([
      Contact.countDocuments({ owner: ownerId }),
      Contact.countDocuments({ owner: ownerId, isFavorite: true }),
      Contact.countDocuments({ owner: ownerId, email: { $ne: null } }),
      Contact.countDocuments({ owner: ownerId, $or: [{ phone: { $ne: null } }, { mobile: { $ne: null } }] }),
      Contact.aggregate([
        { $match: { owner: ownerId } },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),
      Contact.aggregate([
        { $match: { owner: ownerId, company: { $ne: null } } },
        { $group: { _id: '$company', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Activity.find({ user: ownerId }).sort('-createdAt').limit(10).lean()
    ]);

    res.json({
      success: true,
      data: {
        stats: { total, favorites, withEmail, withPhone },
        bySource,
        topCompanies,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tags
// @route   GET /api/contacts/tags
const getTags = async (req, res, next) => {
  try {
    const tags = await Contact.aggregate([
      { $match: { owner: req.user._id } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: { tags } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all groups
// @route   GET /api/contacts/groups
const getGroups = async (req, res, next) => {
  try {
    const groups = await Contact.aggregate([
      { $match: { owner: req.user._id } },
      { $unwind: '$groups' },
      { $group: { _id: '$groups', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: { groups } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContacts, getContact, createContact, updateContact, deleteContact,
  bulkDelete, toggleFavorite, exportCSV, importCSV, getStats, getTags, getGroups
};

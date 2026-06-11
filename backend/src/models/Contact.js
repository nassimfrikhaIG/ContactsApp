const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String
}, { _id: false });

const socialSchema = new mongoose.Schema({
  linkedin: String,
  twitter: String,
  facebook: String,
  instagram: String,
  website: String
}, { _id: false });

const contactSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    default: null
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  mobile: {
    type: String,
    trim: true,
    default: null
  },
  company: {
    type: String,
    trim: true,
    default: null
  },
  jobTitle: {
    type: String,
    trim: true,
    default: null
  },
  department: {
    type: String,
    trim: true,
    default: null
  },
  address: {
    type: addressSchema,
    default: null
  },
  birthday: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  groups: [{
    type: String,
    trim: true
  }],
  social: {
    type: socialSchema,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  lastContacted: {
    type: Date,
    default: null
  },
  source: {
    type: String,
    enum: ['manual', 'import', 'api'],
    default: 'manual'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

contactSchema.index({ owner: 1, email: 1 });
contactSchema.index({ owner: 1, firstName: 'text', lastName: 'text', company: 'text', email: 'text' });
contactSchema.index({ owner: 1, tags: 1 });
contactSchema.index({ owner: 1, groups: 1 });
contactSchema.index({ owner: 1, isFavorite: 1 });

module.exports = mongoose.model('Contact', contactSchema);

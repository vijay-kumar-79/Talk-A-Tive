const mongoose = require("mongoose");

const msgSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: false },
      image: {
        public_id: { type: String },
        url: { type: String }
      }
    },
    users: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }],
      default: undefined, // Important for conditional validation
      validate: {
        validator: function(v) {
          // Users required for private chats
          return !this.isGroup ? v && v.length === 2 : true;
        },
        message: 'Private chats must have exactly 2 users'
      }
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isGroup: {
      type: Boolean,
      required: true // No longer has default
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: undefined, // Important for conditional validation
      validate: {
        validator: function(v) {
          // Group required for group chats
          return this.isGroup ? !!v : true;
        },
        message: 'Group chats must have a group reference'
      }
    }
  },
  { timestamps: true }
);

// Add pre-save validation
msgSchema.pre('save', function(next) {
  if (this.isGroup && !this.group) {
    throw new Error('Group messages must have a group reference');
  }
  if (!this.isGroup && (!this.users || this.users.length !== 2)) {
    throw new Error('Private messages must have exactly 2 users');
  }
  next();
});

// Remove the pre-save hook since we're using validators
module.exports = mongoose.model("Messages", msgSchema);

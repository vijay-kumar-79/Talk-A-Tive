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
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isGroup: {
      type: Boolean,
      default: false
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
    }
  },
  { timestamps: true }
);

msgSchema.pre('save', function(next) {
  if (!this.message.text && !this.message.image) {
    throw new Error('Message must contain either text or image');
  }
  next();
});

module.exports = mongoose.model("Messages", msgSchema);
import mongoose from 'mongoose';

const emailOutboxSchema = new mongoose.Schema(
  {
    enquiryId: { type: String, required: true, ref: 'Enquiry', index: true },
    recipient: { type: String, required: true },
    kind: {
      type: String,
      required: true,
      enum: ['business_notification', 'customer_acknowledgement'],
    },
    subject: { type: String, required: true },
    html: { type: String, required: true },
    text: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'sending', 'sent', 'failed'],
      default: 'pending',
      index: true,
    },
    attempts: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, default: Date.now, index: true },
    lastError: { type: String },
    sentAt: { type: Date },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

emailOutboxSchema.index({ enquiryId: 1, kind: 1, recipient: 1 }, { unique: true });
emailOutboxSchema.index({ status: 1, nextAttemptAt: 1 });

export const EmailOutbox =
  mongoose.models.EmailOutbox || mongoose.model('EmailOutbox', emailOutboxSchema);

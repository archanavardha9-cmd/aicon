import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    kind: { type: String, required: true, enum: ['contact', 'product'] },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    categoryId: { type: String, ref: 'Category' },
    productId: { type: String, ref: 'Product' },
    message: { type: String, required: true },
    idempotencyKey: { type: String },
    requestHash: { type: String, required: true },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

enquirySchema.index(
  { idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } }
);

enquirySchema.virtual('id').get(function () {
  return this._id;
});

export const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);

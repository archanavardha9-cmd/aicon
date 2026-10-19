import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    label: { type: String, required: true, unique: true },
    terms: { type: String, default: '' },
    icon: { type: String, required: true },
    tone: { type: String, required: true },
    image: { type: String },
    description: { type: String },
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

categorySchema.virtual('id').get(function () {
  return this._id;
});

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

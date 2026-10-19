import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    categoryId: { type: String, required: true, ref: 'Category', index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    modelNumber: { type: String },
    imagePath: { type: String },
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
    active: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
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

productSchema.index({ categoryId: 1, active: 1, name: 1 });

productSchema.virtual('id').get(function () {
  return this._id;
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

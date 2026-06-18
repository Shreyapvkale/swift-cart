const { PrismaClient } = require('@prisma/client');

const basePrisma = new PrismaClient();

const prisma = basePrisma.$extends({
  result: {
    product: {
      images: {
        needs: { images: true },
        compute(product) {
          try {
            return JSON.parse(product.images);
          } catch (e) {
            return product.images ? [product.images] : [];
          }
        }
      },
      tags: {
        needs: { tags: true },
        compute(product) {
          try {
            return JSON.parse(product.tags);
          } catch (e) {
            return product.tags ? product.tags.split(',') : [];
          }
        }
      }
    },
    review: {
      images: {
        needs: { images: true },
        compute(review) {
          try {
            return JSON.parse(review.images);
          } catch (e) {
            return review.images ? [review.images] : [];
          }
        }
      }
    }
  }
});

module.exports = prisma;

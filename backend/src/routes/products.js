const express = require('express');

const authenticate = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const router = express.Router();
const prisma = require('../services/db');

// @route   GET /api/categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: true
      },
      orderBy: { sortOrder: 'asc' }
    });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products
router.get('/products', async (req, res, next) => {
  try {
    const {
      q,
      category,
      type,
      minPrice,
      maxPrice,
      brand,
      size,
      color,
      rating,
      sort,
      status,
      limit = 20,
      page = 1
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter query object
    const filter = {
      status: status || 'ACTIVE'
    };

    // Category filter (slug match, or subcategory)
    if (category) {
      filter.category = {
        OR: [
          { slug: category },
          { parent: { slug: category } }
        ]
      };
    }

    if (type) {
      filter.category = {
        ...filter.category,
        type: type.toUpperCase()
      };
    }

    if (brand) {
      filter.brand = { equals: brand, mode: 'insensitive' };
    }

    // Search query matching name, brand, tags, or description
    if (q) {
      filter.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { tags: { contains: q.toLowerCase() } }
      ];
    }

    // Filters on nested product variants
    const variantFilters = {};
    if (minPrice || maxPrice) {
      variantFilters.price = {};
      if (minPrice) variantFilters.price.gte = parseFloat(minPrice);
      if (maxPrice) variantFilters.price.lte = parseFloat(maxPrice);
    }
    if (size) variantFilters.size = { equals: size, mode: 'insensitive' };
    if (color) variantFilters.color = { equals: color, mode: 'insensitive' };

    if (Object.keys(variantFilters).length > 0) {
      filter.variants = {
        some: variantFilters
      };
    }

    // Sorting structure
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { variants: { _min: { price: 'asc' } } };
    } else if (sort === 'price_desc') {
      orderBy = { variants: { _max: { price: 'desc' } } };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    // DB fetch
    const products = await prisma.product.findMany({
      where: filter,
      include: {
        category: true,
        variants: {
          include: {
            inventory: true
          }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy,
      skip,
      take
    });

    // Append aggregates
    const productsWithRating = products.map(p => {
      const totalReviews = p.reviews.length;
      const averageRating = totalReviews > 0
        ? parseFloat((p.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
        : 4.5; // High default for prototype appeal
      return {
        ...p,
        averageRating,
        totalReviews
      };
    });

    const totalCount = await prisma.product.count({ where: filter });

    res.status(200).json({
      success: true,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      products: productsWithRating
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/:slug
router.get('/products/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        vendor: {
          select: { id: true, businessName: true }
        },
        variants: {
          include: {
            inventory: true
          }
        },
        reviews: {
          include: {
            user: { select: { name: true, avatarUrl: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const totalReviews = product.reviews.length;
    const averageRating = totalReviews > 0
      ? parseFloat((product.reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1))
      : 4.5;

    res.status(200).json({
      success: true,
      product: {
        ...product,
        averageRating,
        totalReviews
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/products (vendor/admin only)
router.post('/products', authenticate, roleGuard(['VENDOR', 'ADMIN']), async (req, res, next) => {
  try {
    const { name, description, brand, categoryId, images, tags, variants } = req.body;
    let vendorId = req.body.vendorId;

    // If active role is VENDOR, overwrite vendorId to self
    if (req.user.role === 'VENDOR') {
      const vendorProfile = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
      if (!vendorProfile) return res.status(400).json({ success: false, message: 'Vendor profile context missing.' });
      vendorId = vendorProfile.id;
    }

    if (!name || !categoryId || !variants || variants.length === 0) {
      return res.status(400).json({ success: false, message: 'Fields required: name, categoryId, variants' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().substring(8);
    const sku = `PROD-${Date.now().toString().substring(6)}`;

    const newProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          vendorId,
          categoryId,
          name,
          slug,
          description: description || name,
          brand,
          sku,
          images: JSON.stringify(images || ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=600']),
          tags: JSON.stringify(tags || []),
          status: 'ACTIVE'
        }
      });

      for (const v of variants) {
        const vSku = `${sku}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        const newV = await tx.productVariant.create({
          data: {
            productId: prod.id,
            size: v.size,
            color: v.color,
            weight: v.weight ? parseFloat(v.weight) : null,
            unit: v.unit || 'pcs',
            price: parseFloat(v.price),
            comparePrice: v.comparePrice ? parseFloat(v.comparePrice) : null,
            costPrice: v.costPrice ? parseFloat(v.costPrice) : null,
            skuVariant: vSku
          }
        });

        // Set initial inventory level
        await tx.inventory.create({
          data: {
            variantId: newV.id,
            warehouseId: v.warehouseId || (await tx.warehouse.findFirst()).id,
            quantityAvailable: parseInt(v.quantity || 100),
            quantityReserved: 0,
            lowStockThreshold: 10
          }
        });
      }

      return prod;
    });

    res.status(201).json({ success: true, message: 'Product created successfully!', product: newProduct });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/products/:id (vendor/admin only)
router.put('/products/:id', authenticate, roleGuard(['VENDOR', 'ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, brand, categoryId, images, tags, status } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Validate ownership if VENDOR
    if (req.user.role === 'VENDOR') {
      const vendorProfile = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
      if (existingProduct.vendorId !== vendorProfile.id) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not own this catalog item.' });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        brand,
        categoryId,
        images: images ? JSON.stringify(images) : undefined,
        tags: tags ? JSON.stringify(tags) : undefined,
        status
      }
    });

    res.status(200).json({ success: true, message: 'Product successfully updated.', product: updated });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/products/:id (admin only)
router.delete('/products/:id', authenticate, roleGuard(['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Product successfully purged from catalog.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

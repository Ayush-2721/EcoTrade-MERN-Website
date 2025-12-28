const { Schema, default: mongoose } = require("mongoose")
const Product=require("../models/Product")
const Brand=require("../models/Brand")
const Category=require("../models/Category")

exports.create=async(req,res)=>{
    try {
        console.log('Create product request received with body:', req.body)
        
        // Validate required fields
        const requiredFields = ['title', 'description', 'price', 'category', 'brand', 'stockQuantity', 'condition', 'thumbnail', 'images']
        const missingFields = requiredFields.filter(field => !req.body[field])
        
        if(missingFields.length > 0) {
            console.log('Missing fields:', missingFields)
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            })
        }

        // if brand is provided as a string (not an ObjectId), create a new Brand
        if(req.body.brand && typeof req.body.brand === 'string'){
            // if it's not a valid ObjectId, treat as brand name
            if(!mongoose.Types.ObjectId.isValid(req.body.brand)){
                // if brand with same name exists, reuse it
                const existingBrand = await Brand.findOne({ name: req.body.brand })
                if(existingBrand){
                    req.body.brand = existingBrand._id
                    console.log('Using existing brand:', existingBrand._id)
                } else {
                    const newBrand = new Brand({ name: req.body.brand })
                    await newBrand.save()
                    req.body.brand = newBrand._id
                    console.log('Created new brand:', newBrand._id)
                }
            }
            // if it is a valid ObjectId string, leave as is
        }

        // if category is provided as a string (not an ObjectId), create/find Category
        if(req.body.category && typeof req.body.category === 'string'){
            if(!mongoose.Types.ObjectId.isValid(req.body.category)){
                const existingCat = await Category.findOne({ name: req.body.category })
                if(existingCat){
                    req.body.category = existingCat._id
                    console.log('Using existing category:', existingCat._id)
                } else {
                    const newCat = new Category({ name: req.body.category })
                    await newCat.save()
                    req.body.category = newCat._id
                    console.log('Created new category:', newCat._id)
                }
            }
        }

        const created = new Product(req.body)
        const savedProduct = await created.save()
        
        console.log('Product created successfully:', savedProduct._id)
        
        return res.status(201).json({
            success: true,
            message: 'Product added successfully!',
            data: savedProduct
        })
    } catch (error) {
        console.error('Error creating product:', error)
        return res.status(500).json({
            success: false,
            message: error.message || 'Error adding product, please try again later',
            error: error.errors || error
        })
    }
}

exports.getAll = async (req, res) => {
    try {
        const filter={}
        const sort={}
        let skip=0
        let limit=0

        if(req.query.brand){
            filter.brand={$in:req.query.brand}
        }

        if(req.query.category){
            filter.category={$in:req.query.category}
        }

        if(req.query.user){
            filter['isDeleted']=false
        }

        if(req.query.sort){
            sort[req.query.sort]=req.query.order?req.query.order==='asc'?1:-1:1
        }

        if(req.query.page && req.query.limit){

            const pageSize=req.query.limit
            const page=req.query.page

            skip=pageSize*(page-1)
            limit=pageSize
        }

        const totalDocs=await Product.find(filter).sort(sort).populate("brand").countDocuments().exec()
        const results=await Product.find(filter).sort(sort).populate("brand").skip(skip).limit(limit).exec()

        res.set("X-Total-Count",totalDocs)

        res.status(200).json(results)
    
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error fetching products, please try again later'})
    }
};

exports.getById=async(req,res)=>{
    try {
        const {id}=req.params
        const result=await Product.findById(id).populate("brand").populate("category")
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting product details, please try again later'})
    }
}

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        // if brand is provided as a string (not an ObjectId), create/find a Brand and replace with its ObjectId
        if(req.body.brand && typeof req.body.brand === 'string'){
            if(!mongoose.Types.ObjectId.isValid(req.body.brand)){
                const existingBrand = await Brand.findOne({ name: req.body.brand })
                if(existingBrand){
                    req.body.brand = existingBrand._id
                } else {
                    const newBrand = new Brand({ name: req.body.brand })
                    await newBrand.save()
                    req.body.brand = newBrand._id
                }
            }
        }

        // if category is provided as a string (not an ObjectId), create/find a Category and replace with its ObjectId
        if(req.body.category && typeof req.body.category === 'string'){
            if(!mongoose.Types.ObjectId.isValid(req.body.category)){
                const existingCat = await Category.findOne({ name: req.body.category })
                if(existingCat){
                    req.body.category = existingCat._id
                } else {
                    const newCat = new Category({ name: req.body.category })
                    await newCat.save()
                    req.body.category = newCat._id
                }
            }
        }

        const updated=await Product.findByIdAndUpdate(id,req.body,{new:true})
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error updating product, please try again later'})
    }
}

exports.undeleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const unDeleted=await Product.findByIdAndUpdate(id,{isDeleted:false},{new:true}).populate('brand')
        res.status(200).json(unDeleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error restoring product, please try again later'})
    }
}

exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const deleted=await Product.findByIdAndUpdate(id,{isDeleted:true},{new:true}).populate("brand")
        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error deleting product, please try again later'})
    }
}



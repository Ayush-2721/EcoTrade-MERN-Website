const mongoose=require("mongoose")
const {Schema}=mongoose


const categorySchema=new Schema({
    name:{
        type:String,
        required:true,
        enum: [
            'Smartphones & Tablets',
            'Laptops & Notebooks',
            'Desktop Computers',
            'Computer Accessories',
            'Audio Devices',
            'Cameras & Photography',
            'Gaming Consoles & Accessories',
            'Wearable Technology',
            "Men's Apparel",
            "Women's Apparel",
            'Footwear',
            'Bags & Luggage',
            'Watches & Accessories',
            'Furniture',
            'Home Appliances',
            'Kitchen Appliances',
            'Home Decor',
            'Books & Educational Material',
            'Office Equipment',
            'Bicycles',
            'Motorcycles',
            'Cars',
            'Vehicle Accessories',
            'Sports Equipment',
            'Fitness Equipment',
            'Musical Instruments',
            'Art & Collectibles',
            'Baby & Kids Products',
            'Health & Personal Care',
            'Tools & Hardware',
            'Miscellaneous'
        ]
    }
})

module.exports=mongoose.model("Category",categorySchema)
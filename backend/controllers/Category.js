const Category=require("../models/Category")

exports.getAll=async(req,res)=>{
    try {
        const categories = [
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
        ];
        res.status(200).json(categories);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Error fetching categories"})
    }
}
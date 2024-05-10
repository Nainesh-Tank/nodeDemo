const Joi = require("joi");
const _ = require("lodash");

// exports.validate_login = (user) => {
//   const schema = Joi.object({
//     username: Joi.string().required().label("username"),
//     password: Joi.string().required().label("password"),
//     device_details: Joi.string().required().label("device_details"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addRole = (user) => {
//   const schema = Joi.object({
//     user_type: Joi.number().valid(1, 2, 3).required().label("user_type"),
//     name: Joi.string().required().label("name"),
//     description: Joi.string().empty("").label("description"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_bulkUploadHSN = (user) => {
//   const schema = Joi.object({
//     hsn_group: Joi.number()
//       .valid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
//       .required()
//       .label("hsn_group"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addPermission = (user) => {
//   const schema = Joi.object({
//     permission_data: Joi.string().required().label("permission_data"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addParameterType = (user) => {
//   const schema = Joi.object({
//     type_name: Joi.string().required().label("type_name").messages({
//       "string.base": "LMG table must be a string"
//     }),
//     remark: Joi.string().required().label("remark"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
exports.validate_addAdminLedger = (user) => {
  const schema = Joi.object({
    role_id: Joi.number().required().label("role_id"),
    code: Joi.string().required().label("code"),
    first_name: Joi.string().required().label("first_name"),
    last_name: Joi.string().required().label("last_name"),
    username: Joi.string().min(3).max(30).required().label("username"),
    email: Joi.string().email().required().label("email"),
    gender: Joi.string().valid('M','F').required().label("gender"),
    password: Joi.string().required().label("password"),
    confirm_password: Joi.string().required().label("confirm_password"),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/
      )
      .messages({
        "string.pattern.base":
          "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
      })
      .required()
      .label("new_password"),
    confirm_password: Joi.string()
      .valid(Joi.ref("password"))
      .messages({ "any.only": "Passwords do not match" })
      .label("confirm_password"),
    phone: Joi.string()
      .min(7)
      .max(15)
      .pattern(/^[0-9]+$/)
      .required()
      .label("phone"),
    address: Joi.string().required().label("address"),
    image: Joi.string().empty("").label("image"),
  });
  const { error, value } = schema.validate(user, { abortEarly: false });
  if (error) {
    const errorMessage = _.map(error.details, "message").join(", ");
    return { errorCode: 404, status: false, message: errorMessage };
  }
};
exports.validate_updateAdminLedger = (user) => {
  const schema = Joi.object({
    role_id: Joi.number().required().label("role_id"),
    code: Joi.string().required().label("code"),
    first_name: Joi.string().required().label("first_name"),
    last_name: Joi.string().required().label("last_name"),
    username: Joi.string().required().label("username"),
    gender: Joi.string().valid('M','F').required().label("gender"),
    email: Joi.string().email().required().label("email"),
    phone: Joi.string().min(7).max(15).pattern(/^[0-9]+$/).required().label("phone"),
    address: Joi.string().required().label("address"),
    image: Joi.string().empty("").label("image"),
  });
  const { error, value } = schema.validate(user, { abortEarly: false });
  if (error) {
    const errorMessage = _.map(error.details, "message").join(", ");
    return { errorCode: 404, status: false, message: errorMessage };
  }
};
// exports.validate_addSetting = (user) => {
//   const schema = Joi.object({
//     setting_title: Joi.string().required().label("setting_title"),
//     setting_key: Joi.string().required().label("setting_key"),
//     setting_value: Joi.string().required().label("setting_value"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_changePassword = (user) => {
//   const schema = Joi.object({
//     current_password: Joi.string().required().label("current_password"),
//     new_password: Joi.string()
//       .pattern(
//         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/
//       )
//       .messages({
//         "string.pattern.base":
//           "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.",
//       })
//       .required()
//       .label("new_password"),
//     confirm_password: Joi.string()
//       .valid(Joi.ref("new_password"))
//       .messages({ "any.only": "Passwords do not match" })
//       .label("Confirm Password"),
//   });

//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const confirmPasswordError = error.details.find((detail) => detail.context.key === "confirm_password" && detail.type === "any.only");

//     const errorMessage = confirmPasswordError ? confirmPasswordError.message : _.map(error.details, "message").join(", ");

//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addCountry = (user) => {
//   const schema = Joi.object({
//     name: Joi.string().required().label("name"),
//     country_code: Joi.string().min(2).max(2).required().label("country_code"),
//     currency_code: Joi.string().min(2).max(3).required().label("currency_code"),
//     telephone_prefix: Joi.string().min(2).max(10).required().label("telephone_prefix"),
//     flag: Joi.string().empty("").label("flag"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addState = (user) => {
//   const schema = Joi.object({
//     country_id: Joi.number().required().label("country_id"),
//     name: Joi.string().required().label("name"),
//     code: Joi.string().required().label("code"),
//     is_state: Joi.number().valid(0, 1).required().label("is_state"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addCity = (user) => {
//   const schema = Joi.object({
//     state_id: Joi.number().required().label("state_id"),
//     name: Joi.string().required().label("name"),
//     code: Joi.string().required().label("code"),
//     is_metro_city: Joi.number().valid(0, 1).required().label("is_metro_city"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addPincode = (user) => {
//   const schema = Joi.object({
//     pincode: Joi.string().required().label("pincode"),
//     state_id: Joi.number().required().label("state_id"),
//     city_id: Joi.number().required().label("city_id"),
//     district: Joi.string().required().label("district"),
//     can_cod: Joi.string()
//       .valid(0, 1)
//       .pattern(/^[0-9]+$/)
//       .required()
//       .label("can_cod"),
//     can_replace: Joi.string()
//       .valid(0, 1)
//       .pattern(/^[0-9]+$/)
//       .required()
//       .label("can_replace"),
//     reverse_pickup: Joi.string()
//       .valid(0, 1)
//       .pattern(/^[0-9]+$/)
//       .required()
//       .label("reverse_pickup"),
//     can_wallet_use_in_cod: Joi.string()
//       .valid(0, 1)
//       .pattern(/^[0-9]+$/)
//       .required()
//       .label("can_wallet_use_in_cod"),
//     max_cod_amount: Joi.string().empty("").label("max_cod_amount"),
//     min_cod_amount: Joi.string().empty("").label("min_cod_amount"),
//     open_delivery: Joi.string()
//       .valid(0, 1)
//       .pattern(/^[0-9]+$/)
//       .required()
//       .label("open_delivery"),
//     value_capping: Joi.string().empty("").label("value_capping"),
//     max_weight: Joi.string().empty("").label("max_weight"),
//     is_seller_pickup: Joi.string()
//       .valid(0, 1)
//       .required()
//       .label("is_seller_pickup"),
//     zone: Joi.string().required().label("zone"),
//     additional_tat: Joi.string().required().label("additional_tat"),
//     postal_category: Joi.string().required().label("postal_category"),
//     return_centre: Joi.string().empty("").label("return_centre"),
//     dispatch_centre: Joi.string().empty("").label("dispatch_centre"),
//     dto_centre: Joi.string().empty("").label("dto_centre"),
//     incoming_centre: Joi.string().empty("").label("incoming_centre"),
//     code: Joi.string().empty("").label("code"),
//     sortcode: Joi.string().empty("").label("sortcode"),
//   });

//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addIFSC = (user) => {
//   const schema = Joi.object({
//     bank_id: Joi.number().required().label("bank_id"),
//     ifsc: Joi.string()
//       .regex(/^[A-Z]{4}[0][A-Z0-9]{6}$/)
//       .required()
//       .label("ifsc"),
//     branch: Joi.string().required().label("branch"),
//     country_id: Joi.number().integer().required().label("country_id"),
//     state_id: Joi.number().integer().required().label("state_id"),
//     city_id: Joi.number().integer().required().label("city_id"),
//     district: Joi.string().required().label("district"),
//     address: Joi.string().required().label("address"),
//     std_code: Joi.string().required().label("std_code"),
//     phone: Joi.string()
//       .min(7)
//       .max(15)
//       .pattern(/^[0-9]+$/)
//       .required()
//       .label("phone"),
//   });

//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_pincodeBlock = (user) => {
//   const schema = Joi.object({
//     reason: Joi.string().required().label("reason"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addModule = (user) => {
//   const schema = Joi.object({
//     parent_id: Joi.number().integer().allow(null).label("parent_id"),
//     name: Joi.string().required().label("name"),
//     slug: Joi.string().required().label("slug"),
//     icon: Joi.string().empty("").label("icon"),
//     meta_title: Joi.string().required().label("meta_title"),
//     user_type: Joi.number().valid(1, 2).required().label("user_type"),
//     is_sidemenu_show: Joi.number()
//       .valid(0, 1)
//       .required()
//       .label("is_sidemenu_show"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addHSN = (user) => {
//   const schema = Joi.object({
//     title: Joi.string().label("title").required(),
//     category_ids: Joi.array().label("category_ids").required(),
//     hsn_code: Joi.string().label("hsn_code").required(),
//     four_digit: Joi.string().length(4).label("four_digit").required(),
//     hsn_group: Joi.number().min(1).label("hsn_group").required(),
//     hsn_per: Joi.number().precision(2).label("hsn_per").required(),
//     min_hsn_per: Joi.number().precision(2).label("min_hsn_per").empty(""),
//     min_price: Joi.number().precision(2).label("min_price").empty(""),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addParameterValue = (user) => {
//   const schema = Joi.object({
//     parameter_type_id: Joi.number()
//       .integer()
//       .required()
//       .label("parameter_type_id"),
//     value: Joi.string().required().label("value"),
//     code: Joi.string().required().label("code"),
//     accepted_values: Joi.string().empty("").label("accepted_values"),
//     image: Joi.string().empty("").label("image"),
//     remark: Joi.string().empty("").label("remark"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addFAQ = (user) => {
//   const schema = Joi.object({
//     user_type: Joi.number().valid(2, 3).label("user_type").required(),
//     faq_category_id: Joi.number().label("faq_category_id").required(),
//     faq_que: Joi.string().label("faq_que").required(),
//     faq_ans: Joi.string().label("faq_ans").required(),
//     faq_type: Joi.number().valid(1, 2, 3).label("faq_type").required(),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addTutorials = (user) => {
//   const schema = Joi.object({
//     tutorial_category_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().label("tutorial_category_ids"),
//     tutorial_name: Joi.string().required().label("tutorial_name"),
//     tutorial_thumb: Joi.string().empty("").label("tutorial_thumb"),
//     tutorial_link: Joi.string().uri().required().label("tutorial_link"),
//     tutorial_description: Joi.string().required().label("tutorial_description"),
//     tutorial_type: Joi.number().valid(1, 2, 3).required().label("tutorial_type"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addBanner = (user) => {
//   const schema = Joi.object({
//     used_for: Joi.number().valid(1, 2).required().label("used_for"),
//     name: Joi.string().max(255).required().label("name"),
//     button_name: Joi.string().max(255).required().label("button_name"),
//     description: Joi.string().required().label("description"),
//     redirect_url: Joi.string().uri().required().label("redirect_url"),
//     image: Joi.string().empty("").label("image"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addNewUpdate = (user) => {
//   const schema = Joi.object({
//     used_for: Joi.number().valid(2, 3).required().label("used_for"),
//     title: Joi.string().max(255).required().label("title"),
//     description: Joi.string().required().label("description"),
//     start_time: Joi.string().required().label("start_time"),
//     end_time: Joi.string().required().label("end_time"),
//     image: Joi.string().empty("").label("image"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };

// exports.validate_addHeaderMenu = (user) => {
//   const schema = Joi.object({
//     parent_id: Joi.number().integer().min(0).required().label("parent_id"),
//     title: Joi.string().required().label("title"),
//     menu_type: Joi.number().valid(1, 2, 3, 4).required().label("menu_type"),
//     url: Joi.string().uri().empty("").label("url"),
//     category_id: Joi.number().integer().min(0).required().label("category_id"),
//     product_id: Joi.number().integer().min(0).required().label("product_id"),
//     page_id: Joi.number().integer().min(0).required().label("page_id"),
//     is_bold: Joi.number().valid(0, 1).required().label("is_bold"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addPage = (user) => {
//   const schema = Joi.object({
//     user_type: Joi.number().valid(2, 3).required().label("user_type"),
//     page_name: Joi.string().required().label("page_name"),
//     page_description: Joi.string().required().label("page_description"),
//     html_link: Joi.string().required().label("html_link"),
//     meta_title: Joi.string().empty("").label("meta_title"),
//     meta_description: Joi.string().empty("").label("meta_description"),
//     meta_keywords: Joi.string().empty("").label("meta_keywords"),
//   });

//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addMail = (user) => {
//   const schema = Joi.object({
//     email_to: Joi.string().email().required().label("email_to"),
//     email_cc: Joi.string().email().allow("", null).label("email_cc"),
//     email_bcc: Joi.string().email().allow("", null).label("email_bcc"),
//     subject: Joi.string().required().label("subject"),
//     content: Joi.string().required().label("content"),
//   });

//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addBrand = (user) => {
//   const schema = Joi.object({
//     brand_name: Joi.string().required().label("brand_name"),
//     description: Joi.string().required().label("description"),
//     url: Joi.string().uri().empty("").label("url"),
//     approval_required: Joi.number()
//       .valid(1, 2, 3, 4)
//       .required()
//       .label("approval_required"),
//     image: Joi.string().empty("").label("image"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addCategory = (user) => {
//   const schema = Joi.object({
//     parent_id: Joi.number().required().label("parent_id"),
//     category_name: Joi.string().required().label("category_name"),
//     percentage: Joi.number().precision(2).empty("").label("percentage"),
//     go_percentage: Joi.number().precision(2).empty("").label("go_percentage"),
//     meta_title: Joi.string().empty("").label("meta_title"),
//     meta_description: Joi.string().empty("").label("meta_description"),
//     meta_keywords: Joi.string().empty("").label("meta_keywords"),
//     meta_robots: Joi.string().empty("").label("meta_robots"),
//     brand_ids: Joi.array().label("brand_ids").empty(""),
//     return_days: Joi.number().required().label("return_days"),
//     return_type: Joi.array().label("return_type").required(),
//     return_reason: Joi.array().label("return_reason").empty(""),
//     return_policy: Joi.string().empty("").label("return_policy"),
//     category_type: Joi.number().required().label("category_type"),
//     shipping_option_type: Joi.number().required().label("shipping_option_type"),
//     icon_image: Joi.string().empty("").label("icon_image"),
//     cover_image: Joi.string().empty("").label("cover_image"),
//     size_chart_image: Joi.string().empty("").label("size_chart_image"),
//     image_1: Joi.string().empty("").label("image_1"),
//     image_2: Joi.string().empty("").label("image_2"),
//     image_3: Joi.string().empty("").label("image_3"),
//     image_4: Joi.string().empty("").label("image_4"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_updateCategory = (user) => {
//   const schema = Joi.object({
//     parent_id: Joi.number().required().label("parent_id"),
//     new_parent_id: Joi.number().required().label("new_parent_id"),
//     category_name: Joi.string().required().label("category_name"),
//     percentage: Joi.number().precision(2).empty("").label("percentage"),
//     go_percentage: Joi.number().precision(2).empty("").label("go_percentage"),
//     meta_title: Joi.string().empty("").label("meta_title"),
//     meta_description: Joi.string().empty("").label("meta_description"),
//     meta_keywords: Joi.string().empty("").label("meta_keywords"),
//     meta_robots: Joi.string().empty("").label("meta_robots"),
//     brand_ids: Joi.array().label("brand_ids").empty(""),
//     return_days: Joi.number().required().label("return_days"),
//     return_type: Joi.array().label("return_type").required(),
//     return_reason: Joi.array().label("return_reason").empty(""),
//     return_policy: Joi.string().empty("").label("return_policy"),
//     category_type: Joi.number().required().label("category_type"),
//     shipping_option_type: Joi.number().required().label("shipping_option_type"),
//     icon_image: Joi.string().empty("").label("icon_image"),
//     cover_image: Joi.string().empty("").label("cover_image"),
//     size_chart_image: Joi.string().empty("").label("size_chart_image"),
//     image_1: Joi.string().empty("").label("image_1"),
//     image_2: Joi.string().empty("").label("image_2"),
//     image_3: Joi.string().empty("").label("image_3"),
//     image_4: Joi.string().empty("").label("image_4"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addCategorySize = (user) => {
//   const schema = Joi.object({
//     size_ids: Joi.array().label("size_ids").empty(""),
//     display_name: Joi.string().label("display_name").required(),
//     display_type: Joi.number().valid(0, 1, 2).label("display_type").required(),
//     has_quantity: Joi.number().valid(0, 1).label("has_quantity").required(),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addCategoryBrandAuthDocument = (user) => {
//   const schema = Joi.object({
//     brand_require_document_ids: Joi.array()
//       .label("brand_require_document_ids")
//       .empty(""),
//     brand_require_tradmark_ids: Joi.array()
//       .label("brand_require_tradmark_ids")
//       .empty(""),
//     is_document_required: Joi.number()
//       .valid(0, 1)
//       .label("is_document_required")
//       .required(),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addAttributeType = (user) => {
//   const schema = Joi.object({
//     category_id: Joi.number().required().label("category_id"),
//     attribute_type: Joi.string().label("attribute_type").required(),
//     has_quantity: Joi.number().valid(0, 1).label("has_quantity").required(),
//     is_required_for_shipping: Joi.number()
//       .valid(0, 1)
//       .label("is_required_for_shipping")
//       .required(),
//     is_required_for_searching: Joi.number()
//       .valid(0, 1)
//       .label("is_required_for_searching")
//       .required(),
//     display_type: Joi.number().valid(0, 1, 2).label("display_type").required(),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addAttributeValue = (user) => {
//   const schema = Joi.object({
//     attribute_type_id: Joi.number().required().label("attribute_type_id"),
//     attribute_value: Joi.string().label("attribute_value").required(),
//     accepted_values: Joi.string().label("accepted_values").empty(""),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_addStorePolicy = (user) => {
//   const schema = Joi.object({
//     policy_name: Joi.string().label("policy_name").required(),
//     description: Joi.string().label("description").required(),
//     is_before_login: Joi.number().valid(0, 1).label("is_before_login").required(),
//     user_type: Joi.number().valid(2,3).label("user_type").required(),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_bulkUploadPincode = (user) => {
//   const schema = Joi.object({
//     state_id: Joi.number().integer().required().label("state_id"),
//     city_id: Joi.number().integer().required().label("city_id"),
//     file: Joi.string().empty("").label("file"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };

// exports.validate_saveCategoryMaterial = (user) => {
//   const schema = Joi.object({
//     material_ids: Joi.array().label("material_ids").empty(""),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };

// exports.validate_brandApproval = (user) => {
//   const schema = Joi.object({
//     reason_id: Joi.number().integer().required().label("reason_id"),
//     remark: Joi.string().required().label("remark"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };

// exports.validate_addPushNotification = (user) => {

//   const buttonsSchema = Joi.object({
//     id: Joi.string().allow('').label("id"),
//     text: Joi.string().allow('').label("text"),
//     icon: Joi.string().uri().allow('').label("icon"),
//     url: Joi.string().uri().allow('').label("url"),
//   });

//   const schema = Joi.object({
//     sent_to: Joi.number().valid(1, 2, 3, 4, 5).required().label("sent_to"),
//     ledger_ids: Joi.when("sent_to", {
//       is: Joi.number().valid(4, 5),
//       then: Joi.array().items(Joi.number()).required(),
//       otherwise: Joi.allow(null, ""),
//     }).label("ledger_ids"),
//     gender: Joi.when("sent_to", {
//       is: Joi.number().valid(1, 3),
//       then: Joi.number().valid(1, 2, 3).required(),
//       otherwise: Joi.allow(null, ""),
//     }).label("gender"),
//     country_id: Joi.number().empty("").label("country_id"),
//     state_id: Joi.number().empty("").label("state_id"),
//     city_id: Joi.number().empty("").label("city_id"),
//     pincode: Joi.string().empty("").label("pincode"),
//     important: Joi.number().valid(0, 1).required().label("important"),
//     type_of_customer: Joi.when("sent_to", {
//       is: Joi.number().valid(1, 3),
//       then: Joi.number().valid(1, 2, 3).required(),
//       otherwise: Joi.allow(null, ""),
//     }).label("type_of_customer"),
//     title: Joi.string().max(255).required().label("title"),
//     description: Joi.string().required().label("description"),
//     image: Joi.string().empty("").label("image"),
//     link: Joi.string().empty("").label("link"),
//     web_buttons: Joi.array().items(buttonsSchema).label("web_buttons"),
//     // is_active: Joi.number().valid(0, 1).required().label("is_active"),
//     is_save: Joi.number().valid(0, 1).required().label("is_save"),
//     sent_type: Joi.number().valid(0, 1).required().label("sent_type"),
//     is_schedule: Joi.number().valid(0, 1).required().label("is_schedule"),
//     sent_at: Joi.when("is_schedule", {
//       is: 1,
//       then: Joi.string()
//         .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
//         .raw(),
//       otherwise: Joi.allow(null, ""),
//     }).label("sent_at"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_updateCustomer = (user) => {
//   const schema = Joi.object({
//     prefix: Joi.string().required().label("prefix"),
//     first_name: Joi.string().required().label("first_name"),
//     last_name: Joi.string().required().label("last_name"),
//     email: Joi.string().email().required().label("email"),
//     gender: Joi.number().valid(1, 2).required().label("gender"),
//     image: Joi.string().empty("").label("image"),
//     is_active: Joi.number().valid(0, 1, 2).required().label("is_active"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_updateCustomerAddress = (user) => {
//   const schema = Joi.object({
//     is_default: Joi.number().valid(0, 1).required().label("is_default"),
//     first_name: Joi.string().required().label("first_name"),
//     last_name: Joi.string().required().label("last_name"),
//     email: Joi.string().email().required().label("email"),
//     contact_number: Joi.string().min(7).max(15).pattern(/^[0-9]+$/).required().label("contact_number"),
//     address_type: Joi.string().required().label("address_type"),
//     address: Joi.string().required().label("address"),
//     area: Joi.string().required().label("area"),
//     landmark: Joi.string().required().label("landmark"),
//     country_id: Joi.number().integer().required().label("country_id"),
//     state_id: Joi.number().integer().required().label("state_id"),
//     city_id: Joi.number().integer().required().label("city_id"),
//     pincode: Joi.string().required().label("pincode"),
//     customer_id: Joi.number().integer().required().label("customer_id"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };
// exports.validate_sentNotificationToStore = (user) => {
//   const schema = Joi.object({
//     product_id: Joi.number().integer().required().label("product_id"),
//     subject: Joi.string().label("subject").required(),
//     description: Joi.string().label("description").required(),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// };

// exports.validate_addAdminIP = (user) => {
//   const schema = Joi.object({
//     admin_ledger_id: Joi.number().integer().required().label("admin_ledger_id"),
//     ip_access: Joi.string().ip().required().label("ip_access"),
//     status: Joi.number().valid(0, 1).required().label("status"),
//     description: Joi.string().required().label("description"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// }

// exports.validate_updateAdminIp = (user) => {
//   const schema = Joi.object({
//     admin_ledger_id: Joi.number().integer().required().label("admin_ledger_id"),
//     ip_access: Joi.string().ip().required().label("ip_access"),
//     description: Joi.string().required().label("description"),
//     status: Joi.number().valid(0, 1).required().label("status")
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// }

// exports.validate_CreateEncUser = (user) => {
//   const schema = Joi.object({
//     first_name: Joi.string().required().label("first_name"),
//     last_name: Joi.string().required().label("last_name"),
//     age: Joi.number().required().label("age")
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// }

// exports.validate_addCoupon = (user) => {
//   const schema = Joi.object({
//     coupon_code: Joi.string().required().label("coupon_code"),
//     coupon_name: Joi.string().required().label("coupon_name"),
//     coupon_description: Joi.string().required().label("coupon_description"),
//     terms_n_condition: Joi.string().required().label("terms_n_condition"),
//     coupon_type: Joi.string().valid('O','M').required().label("coupon_type"),
//     per_user_limit: Joi.number().required().label("per_user_limit"),
//     used_for: Joi.number().valid(0, 2, 3).required().label("used_for"),
//     discount_type: Joi.string().valid('F','P').required().label("discount_type"),
//     discount_amount: Joi.number().precision(2).required().label("discount_amount"),
//     start_at: Joi.date().required().label("start_at"),
//     end_at: Joi.date().required().label("end_at"),
//     coupon_max_use: Joi.number().required().label("coupon_max_use"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// }

// exports.validate_addTicketCategory = (user) => {
//   const schema = Joi.object({
//     ticket_category: Joi.string().required().label("ticket_category"),
//     ticket_panel: Joi.number().valid(2, 3).required().label("ticket_panel"),
//     priority: Joi.number().valid(1, 2, 3).required().label("priority"),
//   });
//   const { error, value } = schema.validate(user, { abortEarly: false });
//   if (error) {
//     const errorMessage = _.map(error.details, "message").join(", ");
//     return { errorCode: 404, status: false, message: errorMessage };
//   }
// }
=begin
	
This File contains constants and every global thing

=end


class Constants

    USER_TYPE = {
      'Valid' => 0
    }.freeze 

    # Generic Stubs

    # Stub to check Whether Staging Server is being called
    def self.is_staging_server

     return ENV[Constants::ENVIRONMENT_VAR_FOR_STAGING].present? ? true : false

    end 
    
    # Stub to get Server Initials for AWS File Upload
    def self.get_current_server_initials

      return Constants.is_staging_server ? "dev" : "pro" 
      
    end   

    # Stub to get Business profile pic if it is present otherwise to get Static Pic 
    def self.get_profile_pic(business)
 
      return business.profile_pic.present? ? business.profile_pic.url(:thumb) : 'i2.png'    

    end    

    # Stub to convert date to small MDY format
    def self.convert_date_to_mdy_format(full_date)
        
        full_date.strftime("%Y-%m-%d") if full_date.present?
    
    end 

    # Stub to convert date to detailed MDY format
    def self.convert_date_to_full_format(full_date)
        
        full_date.strftime("%d %b, %Y at %I:%M %p") if full_date.present?
    
    end 

    # Stub to convert date to MDY HH MM SS format
    def self.convert_date_to_mdyhms_format(full_date)
        
        full_date.strftime("%Y-%m-%d %I:%M:%S") if full_date.present?
    
    end 

        # Stub to convert date to MDY at HH:MM AM/PM format
    def self.convert_date_to_mdyhm_ampm_format(full_date)
        
        full_date.strftime("%b %d, %Y at %I:%M %p") if full_date.present?
    
    end 

    # Stub to convert date to MDY HH MM SS format
    def self.convert_date_to_hms_format(full_date)
        
        full_date.strftime("%I:%M:%S") if full_date.present?
    
    end 

    # Request/Response Params

    ## Review Request Parameters

    REQUEST_PARAM_ID                         = "id"
    REQUEST_PARAM_TEXT                       = "text"

    REQUEST_PARAM_LATITUDE                   = "latitude"
    REQUEST_PARAM_LONGITUDE                  = "longitude"

    REQUEST_PARAM_USEREMAIL                  = "user_email"
    REQUEST_PARAM_USERNAME                   = "user_name"
    REQUEST_PARAM_USERPASSWORD               = "user_password"
    REQUEST_PARAM_DESC                       = "desc"
    REQUEST_PARAM_MOBILE                     = "mobile"
    REQUEST_PARAM_RECENT                     = "recent"
    REQUEST_PARAM_PAGE                       = "page" 
    
    # String Constants

    MALE_TEXT                                = "Male"
    FEMALE_TEXT                              = "Female"
    UNSPECIFIED                              = "Unspecified" 
    
    YES_TEXT                                 = "Yes"
    NO_TEXT                                  = "No"
    ENVIRONMENT_VAR_FOR_STAGING              = "Staging" 

    VIEW_TEXT                                = "View"
    EDIT_TEXT                                = "Edit"
    DELETE_TEXT                              = "Delete" 
    SAVE_TEXT                                = "Save"
    CANCEL_TEXT                              = "Cancel"
    SUBMIT_TEXT                              = "Submit"
    DELETE_ALL_TEXT                          = "Delete All"
    REMOVE_TEXT                              = "Remove"

    CREATION_DATE                            = "Created At"  

    MY_PROFILE_TEXT                          = "My Profile"
    HOME_TEXT                                = "Home"
    
    LOGOUT_TEXT                              = "Logout"

    VIEW_ALL_TEXT                            = "View All"     
    TODAY_TEXT                               = "Today"
    SINCE_TEXT                               = "Since"
    
    # ADMIN DASHBOARD OPTIONS START

    USERS_TEXT                               = "Users"
    LAST_24_HOURS_TEXT                       = " In Last 24 Hours"

    # ADMIN DASHBOARD OPTIONS END

    IN_ACTIVE_TEXT                           = "In Active"
    ACTIVE_TEXT                              = "Active"

    SEARCH_TEXT                              = "Search"
    RESET_TEXT                               = "Reset"
    TRASH_TEXT                               = "Trash"
    PASSWORD_TEXT                            = "Password"
    PASSWORD_CONFIRMATION_TEXT               = "Password Confirmation"
    EMAIL_TEXT                               = "Email"
    MOBILE_NO_TEXT                           = "Mobile Number"
    MIN_6_CHARS_HINT                         = "Minimum 6 characters"
    VACATION_MODE_TEXT                       = "Vacation Mode"
    ADDRESS_TEXT                             = "Address"
    LANDMARK_TEXT                            = "Landmark"
    LOCALITY_TEXT                            = "Locality"
    LOCALITIES_TEXT                          = "Localities"
    ZIP_CODE_TEXT                            = "Zip Code" 
    AGENT_CODE_TEXT                          = "Agent Code" 
    PROFESSION_TEXT                          = "Profession" 
    BUSINESS_TYPE_TEXT                       = "Business Type"
    SERVICE_TYPE_TEXT                        = "Service Type"
    JOINING_DATE_TEXT                        = "Joining Date"
    DESCRIPTION_TEXT                         = "Description"    
    CARE_OF_TEXT                             = "c/o "  
    PROFILE_PIC_TEXT                         = "Profile Picture"
    CONTACT_NUMBER_TEXT                      = "Contact No"
    CONTACT_TYPE_TEXT                        = "Contact Type"
    NOTIFICATION_TITLE                       = "MuSync Alert"
    INVALID_EMAIL_ADDRESS                    = "Invalid Email Address"

    
    BACK_ARROW                               = " <<< "

    OPTION_STATUS_DEFAULT                    = "Any Status"
    OPTION_USER_TYPE_DEFAULT                 = "Any User"
    OPTION_STATUS_TYPE_DEFAULT               = 'Any Status'

    OPTION_MOBILE                            = "Mobile"
    OPTION_LANDLINE                          = "Landline"

    SOMETHING_WENT_WRONG 		             = "Something went wrong" 

    CONFIRM_DELETE_TEXT                      = "Are you sure to delete?"

    SUCCESS                                  = "Success"        
    NO_MATCHING_RECORD_FOUND                 = "No matching record found"


end

# Stub to get name initial e.g. "V" for "Vishal Sharma"
class String

    def initial
    
       self[0,1]
    
    end

end

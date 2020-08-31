=begin
	
This File contains constants and every global thing

=end


class Constants

    BUILD_VERSION   = "20200831.0640" # [YYYYMMDD.HHMM] 24 HOURS FORMAT

    FOLLOW_REQUEST_ACTION_MODE_CONFIRM = 1 
    FOLLOW_REQUEST_ACTION_MODE_CANCEL  = 2 

    USER_PROFILE_ACTION_MODE_NAME      = 1
    USER_PROFILE_ACTION_MODE_EMAIL     = 2
    USER_PROFILE_ACTION_MODE_PHOTO     = 3
    USER_PROFILE_ACTION_MODE_PASSWORD  = 4

    BREADCOMB_SECTION_INDEX_USER             = 0
    BREADCOMB_SECTION_INDEX_FOLLOW_REQUEST   = 1 

    BREADCOMB_SECTION_MODE_INDEX             = 0 
    BREADCOMB_SECTION_MODE_SHOW              = 1
    BREADCOMB_SECTION_MODE_ADD               = 2
    BREADCOMB_SECTION_MODE_EDIT              = 3
    BREADCOMB_SECTION_MODE_MISC              = 4

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

    # Stub to get time in current zone
    def self.get_current_time()

      return Time.now.in_time_zone

    end

    # Stub to get Date in current zone
    def self.get_current_date()

      return Constants.get_current_time.to_date

    end

  # Stub to get Breadcomb link based on Section and Mode
  def self.get_breadcomb_link(breadcomb_section_index, breadcomb_link_mode, arr_data)

    link_text         = ""
    data_title        = ""
    data_url_root     = "" 
    section_title     = ""

    data_object       = !arr_data.nil? ? arr_data[0] : nil

    case breadcomb_section_index

     when BREADCOMB_SECTION_INDEX_USER
     
        section_title  = Constants::USERS_TEXT  
        data_url_root  = "users"
        data_title     = data_object.try(:name)    

     when BREADCOMB_SECTION_INDEX_FOLLOW_REQUEST

        section_title  = Constants::FOLLOW_REQUESTS_TEXT  
        data_url_root  = "user_follow_requests"
        data_title     = data_object.try(:name)                          

    end # End of Case

=begin

    BREADCOMB_SECTION_INDEX_GP_D_FEEDBACKS   = 13    

=end


    case breadcomb_link_mode

      when BREADCOMB_SECTION_MODE_INDEX

        link_text = "<nav aria-label='breadcrumb' class='d-none d-md-inline-block ml-md-4'><ol class='breadcrumb'><li class='breadcrumb-item active'> #{section_title} </li></o></nav>".html_safe
      
      when BREADCOMB_SECTION_MODE_SHOW

        link_text = "<nav aria-label='breadcrumb' class='d-none d-md-inline-block ml-md-4'><ol class='breadcrumb'><i class='ob-icons icon-double-left text-muted breadcrumb-icon'></i><li class='breadcrumb-item'><a href='../#{data_url_root}'> #{section_title} </a></li> <li class='breadcrumb-item active' >#{data_title}</li></o></nav>".html_safe 

      when BREADCOMB_SECTION_MODE_ADD

        is_reload = !arr_data.nil? ? arr_data[1] : false

        root_depth  = is_reload ? "" : "../"

        link_text = "<nav aria-label='breadcrumb' class='d-none d-md-inline-block ml-md-4'><ol class='breadcrumb'><i class='ob-icons icon-double-left text-muted breadcrumb-icon'></i><li class='breadcrumb-item'><a href='#{root_depth}#{data_url_root}'> #{section_title} </a></li></o></nav>".html_safe

      when BREADCOMB_SECTION_MODE_EDIT

        is_reload = !arr_data.nil? ? arr_data[1] : false

        root_depth  = is_reload ? "" : "../"

        link_text = "<nav aria-label='breadcrumb' class='d-none d-md-inline-block ml-md-4'><ol class='breadcrumb'><i class='ob-icons icon-double-left text-muted breadcrumb-icon'></i><li class='breadcrumb-item'><a href='#{root_depth}../#{data_url_root}'> #{section_title} </a></li> <li class='breadcrumb-item' ><a href='#{root_depth}../#{data_url_root}/#{data_object.id}'>#{data_title}</a></li><li class='breadcrumb-item active'>Edit</li></o></nav>".html_safe
      
      when BREADCOMB_SECTION_MODE_MISC

        misc_object_title = !arr_data.nil? ? arr_data[1] : ""

        if arr_data.size  == 2

          link_text =  "<nav aria-label='breadcrumb' class='d-none d-md-inline-block ml-md-4'><ol class='breadcrumb'><i class='ob-icons icon-double-left text-muted breadcrumb-icon'></i><li class='breadcrumb-item'><a href='../../#{data_url_root}'> #{section_title} </a></li> <li class='breadcrumb-item' ><a href='../../#{data_url_root}/#{data_object.id}'>#{data_title}</a></li><li class='breadcrumb-item active'>#{misc_object_title}</li></o></nav>".html_safe 

        elsif arr_data.size == 3

           second_url_construct = arr_data[2]

           secondary_data_url   = second_url_construct[1]
           secondary_data_title = second_url_construct[0]   

          link_text = "<nav aria-label='breadcrumb' class='d-none d-md-inline-block ml-md-4'><ol class='breadcrumb'><i class='ob-icons icon-double-left text-muted breadcrumb-icon'></i><li class='breadcrumb-item'><a href='../../#{data_url_root}'> #{section_title} </a></li> <li class='breadcrumb-item' ><a href='../../#{data_url_root}/#{data_object.id}'>#{data_title}</a></li> <li class='breadcrumb-item' ><a href='../../#{data_url_root}/#{data_object.id}/#{secondary_data_url}?id=#{data_object.id}'>#{secondary_data_title}</a></li> <li class='breadcrumb-item active'>#{misc_object_title}</li></o></nav>".html_safe             

        end

    end # end of Case

    return link_text

  end

    # Request/Response Params

    ## Review Request Parameters

    REQUEST_PARAM_ID                         = "id"
    REQUEST_PARAM_TEXT                       = "text"

    REQUEST_PARAM_USER_TO_FOLLOW_ID          = "user_to_follow_id"
    REQUEST_PARAM_MODE                       = "mode" 

    REQUEST_PARAM_LATITUDE                   = "latitude"
    REQUEST_PARAM_LONGITUDE                  = "longitude"

    REQUEST_PARAM_USEREMAIL                  = "user_email"
    REQUEST_PARAM_USERNAME                   = "user_name"
    REQUEST_PARAM_USERPASSWORD               = "user_password"
    REQUEST_PARAM_CURRENT_PASSWORD           = "current_password"
    REQUEST_PARAM_USERPHOTO                  = "photo"

    REQUEST_PARAM_DESC                       = "desc"
    REQUEST_PARAM_MOBILE                     = "mobile"
    REQUEST_PARAM_RECENT                     = "recent"
    REQUEST_PARAM_PAGE                       = "page" 
    

    RESPONSE_PARAM_STATUS_TEXT               = "status_text"
    

    # String Constants

    MALE_TEXT                                = "Male"
    FEMALE_TEXT                              = "Female"
    UNSPECIFIED                              = "Unspecified" 

    STATUS_TEXT                              = "Status"
    
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
    FOLLOW_REQUESTS_TEXT                     = "Follow Requests"
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

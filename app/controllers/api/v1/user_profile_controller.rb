class Api::V1::UserProfileController < ApiController
  
  # Stub to update user photo
  def user_profile_action

=begin
    :: Expected Params ::
  
  Constants::REQUEST_PARAM_MODE                 => Action Mode [1 for Name, 2 for photo, 3 for password]
  Constants::REQUEST_PARAM_USERPHOTO            => User Photo
  Constants::REQUEST_PARAM_USERPASSWORD         => Password  
  Constants::REQUEST_PARAM_CURRENT_PASSWORD     => Current Password
  Constants::REQUEST_PARAM_USEREMAIL            => User Email 

=end 

    begin

      user = current_user rescue nil

      error_msg = ""
      
      if param_mode == Constants::USER_PROFILE_ACTION_MODE_NAME

        if param_username == "" || param_username.nil?
          error_msg = "Use valid username"
        else        

          is_exist_name = User.where("id != ? and name = ?", current_user.id, param_username)

          if is_exist_name.size == 0
            current_user.name = param_username 
          else
            error_msg = "username already exist"
          end  

        end

      elsif param_mode == Constants::USER_PROFILE_ACTION_MODE_EMAIL

        if param_user_email == "" || param_user_email.nil?
          error_msg = "Use valid email"
        else

          is_exist_mail = User.where("id != ? and email = ?", current_user.id, param_user_email)

          if is_exist_mail.size == 0
            current_user.email = param_user_email 
          else
            error_msg = "email already exist"
          end  

        end

      elsif param_mode == Constants::USER_PROFILE_ACTION_MODE_PHOTO

        if param_photo == "" || param_photo.nil?
          error_msg = "Use valid photo"
        else
          current_user.photo = param_photo 
        end

      elsif param_mode == Constants::USER_PROFILE_ACTION_MODE_PASSWORD

        if current_user.valid_password?(param_current_password) == false 
          error_msg = 'Incorrect current password'     
        else
          new_encrpted_password = User.new(:password => param_password).encrypted_password
          current_user.encrypted_password = new_encrpted_password
        end 

      end

      if error_msg == ""
      
        if current_user.save  
          render json: {status: status_code(:ok), message: ''}
        else
          render json: {status: status_code(:unprocessable_entity), message: current_user.errors}    
        end

      else

        render json: {status: status_code(:unprocessable_entity), message: error_msg} 

      end


    rescue =>e
  
      ## Record Error
      # area, name, body, reason, related_info
      render json: {status: status_code(:unprocessable_entity), message: Constants::SOMETHING_WENT_WRONG, data: {errors: e.message}}

    end   

  end 

  # Stub to get Followers List
  def get_followers

    begin

      users  = UserFollowRequest.where("user_to_follow_id = #{current_user.id} and is_confirmed = 1").all.map{ |follow_request| {:id => follow_request.user.id, :name => follow_request.user.name, :is_verified => follow_request.user.is_verified, :photo_url => follow_request.user.photo}}

      if users.present?
        render json: {status: status_code(:ok), message: '', data: users}
      else
        render json: {status: status_code(:not_found), message: Constants::NO_MATCHING_RECORD_FOUND}
      end  

    rescue =>e
  
      render json: {status: status_code(:unprocessable_entity), message: Constants::SOMETHING_WENT_WRONG, data: {errors: e.message}}

    end 

  end

  # Stub to get Followings List
  def get_followings

    begin

      users  = UserFollowRequest.where("user_id = #{current_user.id} and is_confirmed = 1").all.map{ |follow_request| {:id => follow_request.user_to_follow.id, :name => follow_request.user_to_follow.name, :is_verified => follow_request.user_to_follow.is_verified, :photo_url => follow_request.user_to_follow.photo}}

      if users.present?
        render json: {status: status_code(:ok), message: '', data: users}
      else
        render json: {status: status_code(:not_found), message: Constants::NO_MATCHING_RECORD_FOUND}
      end  

    rescue =>e
  
      render json: {status: status_code(:unprocessable_entity), message: Constants::SOMETHING_WENT_WRONG, data: {errors: e.message}}

    end 

  end

  # Stub to get Pending Requests List
  def get_pending_requests

    begin

      users  = UserFollowRequest.where("user_to_follow_id = #{current_user.id} and is_confirmed = 0 and is_cancelled = 0").all.map{ |follow_request| {:id => follow_request.user.id, :name => follow_request.user.name, :is_verified => follow_request.user.is_verified, :photo_url => follow_request.user.photo}}

      if users.present?
        render json: {status: status_code(:ok), message: '', data: users}
      else
        render json: {status: status_code(:not_found), message: Constants::NO_MATCHING_RECORD_FOUND}
      end  

    rescue =>e
  
      render json: {status: status_code(:unprocessable_entity), message: Constants::SOMETHING_WENT_WRONG, data: {errors: e.message}}

    end 

  end

  def param_username

    params[Constants::REQUEST_PARAM_USERNAME]

  end  

  def param_user_email

    params[Constants::REQUEST_PARAM_USEREMAIL]

  end   

  def param_password

    params[Constants::REQUEST_PARAM_USERPASSWORD]

  end  

  def param_current_password

    params[Constants::REQUEST_PARAM_CURRENT_PASSWORD]

  end

  def param_photo

    params[Constants::REQUEST_PARAM_USERPHOTO]

  end

  def param_mode

    params[Constants::REQUEST_PARAM_MODE]

  end 

end

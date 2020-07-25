class Api::V1::UsersController < ApiController
  skip_before_action :authenticate_user! 

  before_action :find_user, only: [:login]

  # Stub to SignIn to MuSync platform
  def login

=begin
    :: Expected Params ::

  Constants::REQUEST_PARAM_USERNAME     => Username
  Constants::REQUEST_PARAM_USERPASSWORD => UserPassword

=end

    # Look up for User in database
    find_user

    if @user
      @user.signin!(request)

      render json: {status: status_code(:ok), message: '', data: @user.as_signin_json}
    
    end

  end

  # Stub to SignUp into MuSync platform
  def signup
  
    # Look up for User in database
    @user = User.find_by(name: param_username)  

    if @user

      @user = nil
      render json: {status: status_code(:conflict), message: "Username already exists. Please sign in using your mobile." }
  
    else
      
      @user = User.create(name: param_username, email: param_user_email, password: param_password)

      if !@user.save
        render json: {status: status_code(:unprocessable_entity), message: 'Validation errors', data: {errors: @user.errors}}
        return
      end

      @user.signin!(request)
      
      render json: {
        status: status_code(:ok),
        message: 'Signed in successfully!',
        data: @user.as_signin_json
      }

    end

  end

  # Stub to Lookup & Process Forgot UserPassword
  def forgot_password

=begin
    :: Expected Params ::

  Constants::REQUEST_PARAM_USERNAME => Username

=end

    # Look up for User in database
    @user = User.find_by(name: param_username)  

    if @user

    # send Email 

      render json: {status: status_code(:ok), message: "User details has been sent to associated email." }    

    else

      # InCase Username NOT FOUND
      render json: {status: status_code(:not_found), message: "Invalid username" }    

    end  

  end

  # Stub to Lookup & Process Forgot UserName
  def forgot_username

=begin
    :: Expected Params ::

  Constants::REQUEST_PARAM_USEREMAIL => UserEmail

=end

    # Look up for User in database
    @user = User.find_by(email: param_user_email)  

    if @user

    # send Email 

      render json: {status: status_code(:ok), message: "User details has been sent to email." }    

    else

      # InCase Username NOT FOUND
      render json: {status: status_code(:not_found), message: "Invalid user email" }    

    end  

  end

    # Stub for autocomplete user name search
  def search

=begin
    :: Expected Params ::
  
  Constants::REQUEST_PARAM_TEXT            => User name

=end  

    begin  

      users = User.where("name LIKE (?)", "%#{param_text}%").order('name ASC') #.map { |user| {:id => user.id, :name => user.name, :is_verified => user.is_verified. :photo_url => user.photo} }

      if users.present?
        render json: {status: status_code(:ok), message: '', data: users}
      else
        render json: {status: status_code(:not_found), message: Constants::NO_MATCHING_RECORD_FOUND}
      end  

    rescue =>e
  
      render json: {status: status_code(:unprocessable_entity), message: Constants::SOMETHING_WENT_WRONG, data: {errors: e.message}}

    end 

  end

  # Stub for permitted parameters in posted request

  def param_text

    params[Constants::REQUEST_PARAM_TEXT]

  end

  # Stub to configure Staging/Production Environment
  def configure_environment

=begin
    :: Expected Params ::
  
  Constants::REQUEST_PARAM_TEST => Server Mode (Is Production or Staging?) 

=end  

    if params[Constants::REQUEST_PARAM_TEST].present?

      if params[Constants::REQUEST_PARAM_TEST] == "1"

        ENV[Constants::ENVIRONMENT_VAR_FOR_STAGING] = '1'

      else
    
        ENV.delete(Constants::ENVIRONMENT_VAR_FOR_STAGING)  

      end  

    end  

    render json: {status: status_code(:ok), message: "", data: {:is_staging => (ENV[Constants::ENVIRONMENT_VAR_FOR_STAGING].present? ? 1 : 0)}}

  end

  # Stub to get Current Environment Whether 
  def show_current_environment

    render json: {status: status_code(:ok), message: "", data: {:is_staging => (ENV[Constants::ENVIRONMENT_VAR_FOR_STAGING].present? ? 1 : 0)}}

  end  

  private

  def find_user
    
    @user = User.find_by(name: param_username)

    if @user
      
      # InCase Password does not match
      if @user.valid_password?(param_password) == false

        @user = nil
        render json: {status: status_code(:unprocessable_entity), message: "Login failed: Incorrect current password"}

      end  

    else
      
      # InCase Username NOT FOUND
      render json: {status: status_code(:not_found), message: "Login failed: Invalid username" }

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

end

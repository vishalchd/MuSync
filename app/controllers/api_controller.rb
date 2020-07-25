class ApiController < ActionController::Base

  API_KEYS = API_CONFIG['api_keys'].freeze
  X_API_KEY = 'X-Api-Key'.freeze
  X_AUTH_TOKEN = 'X-Auth-Token'.freeze

  before_action :authenticate_api_key!
  before_action :authenticate_user!

  private

  def authenticate_api_key!
    unless API_KEYS[request.headers[X_API_KEY]]
      render json: {status: status_code(:unauthorized), message: 'Invalid api key.', data: {}}
    end
  end

  def authenticate_user!
	@_user = JwtUtil.get_user(request.headers[X_AUTH_TOKEN])

	unless @_user
	  render json: {status: status_code(:unauthorized), message: "Invalid auth token", data: {}}
	end
  end

  def current_user
    @_user
  end

  def param_lat
    params[Constants::REQUEST_PARAM_LATITUDE]
  end

  def param_long
    params[Constants::REQUEST_PARAM_LONGITUDE]
  end

  def build_response(status_code, data = {})
	status = API_STATUS_CODES[status_code]

	response = {
	  status: status[:code],
	  message: status[:message]
	}

	if status_code == :no_error
	  response[:data] = data
	elsif status_code == :validation_errors
	  response[:errors] = data
	else
	  response[:data] = data
	end

	response
	
  end

  def render_no_error(data, message = nil)
    render json: { status: 0, message: message, data: data }
  end

  def status_code symbol
	Rack::Utils::SYMBOL_TO_STATUS_CODE[symbol]
  end
end

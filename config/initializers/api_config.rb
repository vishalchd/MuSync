
API_STATUS_CODES = YAML.load_file(Rails.root.join('config', 'api_status_codes.yml')).freeze
API_CONFIG = YAML.load_file(Rails.root.join('config', 'api_config.yml'))[Rails.env].freeze

require 'jwt_util'


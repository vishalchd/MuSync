require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

Dotenv::Railtie.load

module MuSync
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1
    config.time_zone = 'Chennai'

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.
    config.to_prepare do
      
      Devise::SessionsController.layout 'partner_login'
      Devise::PasswordsController.layout "partner_login"
    
    end

    config.generators.stylesheets = false
    config.generators.javascripts = false
    config.assets.precompile += ["*.ttf", "*.woff", "*.svg", "*.eot"] 

  end
end

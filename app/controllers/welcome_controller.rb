class WelcomeController < ApplicationController

  def index
  end

  def health
    render plain: 'OK'
  end

  # Stub to set Staging Environment variable post deployment
  def health_with_staging_environment_setup

	ENV[Constants::ENVIRONMENT_VAR_FOR_STAGING] = '1'
    render plain: 'OK'
  end	

end

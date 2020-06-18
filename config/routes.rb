Rails.application.routes.draw do

  devise_for :users
  
  devise_for :admin_users
  authenticated :admin_user do
    root to: 'admin/dashboard#index', as: :authenticated_root

  end

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  namespace :api, defaults: { format: :json } do

    namespace :v1 do
      post 'login'                 => 'users#login'
      post 'signup'                => 'users#signup'    
      post 'forgot_password'       => 'users#forgot_password'
      post 'forgot_username'       => 'users#forgot_username'      

    end

  end

  namespace :admin do

  	resources :users

  end

  get 'health'  => 'welcome#health'
  root 'welcome#index'

end

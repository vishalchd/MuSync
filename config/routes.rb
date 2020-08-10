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
      post 'make_follow_request'   => 'follow_requests#create_follow_request'
      post 'follow_request_action' => 'follow_requests#follow_request_action'

      resources :users do
        collection do
          post :search
        end
      end

    end

  end

  namespace :admin do

  	resources :users do

      get 'show_followers' => 'users#show_followers', as: :show_followers
      get 'show_followings' => 'users#show_followings', as: :show_followings
      get 'show_pending_requests' => 'users#show_pending_requests', as: :show_pending_requests      

    end

    resources :user_follow_requests


  end

  get 'health'  => 'welcome#health'
  root :to => 'welcome#index'

end

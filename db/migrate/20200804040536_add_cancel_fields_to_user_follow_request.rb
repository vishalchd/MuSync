class AddCancelFieldsToUserFollowRequest < ActiveRecord::Migration[5.1]
  def change

    add_column :user_follow_requests, :is_cancelled, :boolean, default: 0
    add_column :user_follow_requests, :cancelled_on, :datetime
    add_column :user_follow_requests, :confirmed_on, :datetime    

  end
end

class UserFollowRequest < ApplicationRecord
  belongs_to :user
  belongs_to :user_to_follow, :class_name => "User", :foreign_key  => "user_to_follow_id"

  scope :last_24_hours, ->{ where("created_at >= ?", 24.hours.ago)}
  scope :confirmed_in_last_24_hours, ->{ where("confirmed_on >= ?", 24.hours.ago)}

  scope :default_order, -> { order(created_at: :desc) }

end

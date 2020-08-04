class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable,
         :recoverable, :rememberable, :trackable, :validatable

  validates :name, presence: true
  validates :email, allow_blank: true, uniqueness: true, format: { with: Devise.email_regexp, message: Constants::INVALID_EMAIL_ADDRESS }

  has_many :user_follow_requests, dependent: :destroy

  scope :last_24_hours, ->{ where("created_at >= ?", 24.hours.ago)}

  # Stub to setup Json to be returned on Successful SignIN Request
	def as_signin_json
    {
      id: id,
      auth_token: JwtUtil.encode(id, current_sign_in_at),
      name: name,
      email: email,
      created_at: created_at
    }
  end

  def active_for_authentication?
    self.confirmed_at.present?
  end

  def signin!(request)
    self.update_tracked_fields!(request)
  end
  

end

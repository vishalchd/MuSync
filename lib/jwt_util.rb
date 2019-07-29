module JwtUtil
  module_function

  ALGORITHM = 'HS256'.freeze
  ALGORITHM_PARAMS = { algorithm: ALGORITHM }.freeze
  HMAC_SECRET = API_CONFIG['jwt_secret'].freeze

  ID = 'id'.freeze
  TS = 'ts'.freeze

  def encode(user_id, time)
    JWT.encode({ id: user_id, ts: time.to_i }, HMAC_SECRET, ALGORITHM)
  end

  def get_user(token)
    v = JWT.decode(token, HMAC_SECRET, true, ALGORITHM_PARAMS).first

    user = User.find(v[ID])

    if user.current_sign_in_at.to_i == v[TS]
      return user
    end
  rescue
    return nil
  end

end

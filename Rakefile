def colorize(text, color)
  color_codes = {
    :black    => 30,
    :red      => 31,
    :green    => 32,
    :yellow   => 33,
    :blue     => 34,
    :magenta  => 35,
    :cyan     => 36,
    :white    => 37
  }
  code = color_codes[color]
  if code == nil
    text
  else
    "\033[#{code}m#{text}\033[0m"
  end
end

def upload_to_s3(files, bucket_name)
  # rvm install 1.9.3
  # gem install aws-sdk
  require 'aws-sdk'
  puts colorize("Uploading to S3", :blue)
  AWS.config(access_key_id: ENV["AWS_ACCESS_KEY_ID"], secret_access_key: ENV["AWS_SECRET_ACCESS_KEY"], region: ENV["AWS_REGION"])
  bucket = AWS.s3.buckets[bucket_name]
  if not bucket.exists? then
    bucket = AWS.s3.buckets.create(bucket_name, :acl => :public_read)
    bucket.configure_website
  end
  files.each { |filename|
    key = File.basename(filename)
    obj = bucket.objects[key]
    obj.write(:file => filename, :acl => :public_read)
    puts obj.public_url
  }
  puts colorize("Upload finished", :green)
end

js = ["gat-replay-engine", "gat-replay-truco"]

task :minify do
  # sh "npm install minify"
  sh "mkdir -p min/"
  js.each { |lib|
    sh "./node_modules/minify/bin/minify src/#{lib}.js min/#{lib}.min.js"
  }
end

task :upload => [:minify] do
  bucket = "replay-engine"
  upload_to_s3(js.map { |f| "./min/#{f}.min.js" }, bucket)
  upload_to_s3(["libs/fabric.min.js"], bucket)
end

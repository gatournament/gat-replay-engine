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

task :minify do
  # sh "npm install minify"
  sh "mkdir -p min/"
  js = ["gat-replay-engine", "gat-replay-truco"]
  js.each { |lib|
    sh "./node_modules/minify/bin/minify src/#{lib}.js min/#{lib}.min.js"
  }
end
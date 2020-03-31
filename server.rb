require 'sinatra'
require 'json'

#Used to write a VDAT header of the correct length and endianness to the
#file
def byte_to_ascii(length)
  bits = length.to_s(2)
  
  until bits.length == 32
    bits = bits.chars.unshift(0).join("")
  end
  reps = []
  
  reps.push(bits[0...8].to_i(2).chr)
  reps.push(bits[8...16].to_i(2).chr)
  reps.push(bits[16...24].to_i(2).chr)
  reps.push(bits[24...32].to_i(2).chr)
  reps.reverse!
  
  return reps
end

get '/?' do
  erb :phonemeEditor
end

post '/?' do
    params.to_s
    tmpfile = params[:file][:tempfile]
    f = tmpfile.read

    #WHO VOLUNTARILY SUBMITS TO RIFF
    #PERHAPS THEY MUST??? JESUS
    bigEndianSmallEndianWHOCARES = byte_to_ascii(params[:phonemedata].length + 13)
    f += "VDAT"
    f += bigEndianSmallEndianWHOCARES[0]
    f += bigEndianSmallEndianWHOCARES[1]
    f += bigEndianSmallEndianWHOCARES[2]
    f += bigEndianSmallEndianWHOCARES[3] 
    f += params[:phonemedata]

    # Force response to trigger a download
    # If wav generation is proving unreliable, then 
    # simply extract params[:phonemedata] instead and import it to your phonemeeditor inside hlfaceposer.exe
    response.headers['Content-Type'] = "application/octet-stream"
    response.headers['Content-Disposition'] = "attachment; filename=\"#{params[:file][:filename]}\""

    return f
end

# Queries your phoneme dictionary so that you don't
# have to redefine phonemes for each word every time
get '/word/:query/?' do
  phonemes = []
  puts params
  File.open("phonemeDB.txt", "r").each do |line|
    line = line.chomp.split(" ")
    if line[0] == params[:query] then
      line.shift
      phonemes = line
      break
    end
  end
  return JSON.unparse(phonemes)
end

# Creates an entry in your phoneme word database (huehue text file)
post '/word/?' do
  request.body.rewind
  body = JSON.parse request.body.read
  word = body["word"]
  phonemes = body["phonemes"].join " "
  open("phonemeDB.txt", "a") do |f|
    f.puts "#{word} #{phonemes}"
  end
  return "ok"
end
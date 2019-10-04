require 'json'


abbrData = {};
File.open('bart-area.csv', 'r') do |f|
  f.each_line do |line|
    abbr = line.split(',')
    abbrData[abbr[0].upcase] = [abbr[1], abbr[2].chomp()]
  end
end



parsedData = {};

File.open('data.csv', 'r').each do |line|

  #delete the new line char
  line.delete!("\n")
  #create array of the line
  bartData = line.split(',')
  
  #find the bay area 
  area = abbrData[bartData[3]][1]

  # create a ruby hash
  #1st key: date
  if parsedData.key?(bartData[0])
    #2nd key: hour
    if parsedData[bartData[0]].key?(bartData[1])
      #3rd key: origin
      if parsedData[bartData[0]][bartData[1]].key?(bartData[2])
        #4th key: area
        if parsedData[bartData[0]][bartData[1]][bartData[2]].key?(area)
          parsedData[bartData[0]][bartData[1]][bartData[2]][area][bartData[3]] = bartData[4]
        else
          parsedData[bartData[0]][bartData[1]][bartData[2]][area] = {}
        end
      else
        parsedData[bartData[0]][bartData[1]][bartData[2]] = {}
      end      
    else
      parsedData[bartData[0]][bartData[1]] = {}
    end
  else
    parsedData[bartData[0]] = {}
  end


end


# create JSON from ruby hash

File.open("ruby-write-test", "w") do |f|
  f.write(JSON.generate(parsedData))
end




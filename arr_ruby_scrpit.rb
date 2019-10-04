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
  parsedData[bartData[0]] ||= {}

  #2nd key: hour
  parsedData[bartData[0]][bartData[1]] ||= {}

  # 3rd key: origin
  parsedData[bartData[0]][bartData[1]][bartData[2]] ||= {"data": {"name": bartData[2], "areaHash": {}},"children": []}

  
  # 4th key: area and 5th key: dest and passengers
  if parsedData[bartData[0]][bartData[1]][bartData[2]][:data][:areaHash][area] == 1
    #add the 5th key
    parsedData[bartData[0]][bartData[1]][bartData[2]][:children].each do |child|
      if child[:name] == area 
        child[:children].push({"name": bartData[3], "value": bartData[4]})
      end
    end
  else 
    parsedData[bartData[0]][bartData[1]][bartData[2]][:data][:areaHash][area] = 1
    parsedData[bartData[0]][bartData[1]][bartData[2]][:children].push({"name": area, "children": []})
    #add the current line of data as the 5th layer
    parsedData[bartData[0]][bartData[1]][bartData[2]][:children][-1][:children].push({"name": bartData[3], "value": bartData[4]})
  end

 
end


# create JSON from ruby hash

File.open("ruby-write-test", "w") do |f|
  f.write(JSON.generate(parsedData))
end




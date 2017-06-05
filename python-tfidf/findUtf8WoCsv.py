import os

ctr = 0

for subdir, dirs, files in os.walk('/Users/owidder/dev/iteragit/nge/f2-all'):
    for file in files:
        file_path = subdir + os.path.sep + file
        if file_path.endswith('utf8'):
            if not os.path.isfile(file_path + '.csv'):
                print(file_path)
                ctr += 1


print(ctr)

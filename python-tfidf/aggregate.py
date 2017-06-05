import os
import csv

FOLDER_VALUES_FILE_NAME = '_.csv'

def aggregateValuesInFile(file_path, current_values):
    csvreader = csv.reader(file_path, delimiter="\t")
    for row in csvreader:
        k = row[0]
        v = row[1]
        if k in current_values:
            current_values[v] += k
        else:
            current_values[v] = k


def aggregateValuesInSubfolder(subdir_path, current_values):
    csv_values = subdir_path + "/" + FOLDER_VALUES_FILE_NAME
    if not os.path.isfile(csv_values):
        aggregateFolder(subdir_path)

    aggregateValuesInFile(csv_values, current_values)


def aggregateFolder(folder_path):
    values = {}

    for f in os.listdir(folder_path):
        full_path = folder_path + '/' + f
        if(os.path.isfile(full_path)):
            if(f.endswith('utf8.csv')):
                aggregateValuesInFile(full_path, values)
        else:
            aggregateValuesInSubfolder(full_path, values)

    out_file = open(folder_path + '/' + FOLDER_VALUES_FILE_NAME, 'w')
    for k in values.keys():
        print(k + "\t" + values[k], file=out_file)


aggregateFolder('/Users/owidder/dev/iteragit/nge/f2-all/oci/InkassoServer/AblaufServer/nbproject')
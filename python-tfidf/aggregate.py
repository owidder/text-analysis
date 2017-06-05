import os

FOLDER_VALUES_FILE_NAME = '_.csv'

def aggregateValuesInFile(file_path, current_values):
    with open(file_path, 'r') as f:
        for line in f:
            kv = line.split("\t")
            k = kv[0]
            v = float(kv[1])
            if k in current_values:
                current_values[k] += v
            else:
                current_values[k] = v


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

    with open(folder_path + '/' + FOLDER_VALUES_FILE_NAME, 'w') as out_file:
        keys_sorted_after_values = sorted(values, key=values.__getitem__, reverse=True)
        for k in keys_sorted_after_values:
            print(k + "\t" + str(values[k]), file=out_file)


aggregateFolder('/Users/owidder/dev/iteragit/nge/f2-all/oci/InkassoServer/AblaufServer/nbproject')
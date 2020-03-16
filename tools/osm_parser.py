import xml.etree.ElementTree as ET
import json
from random import randrange

data = {}
node_info = {}


def parse_way(way):
    nodes = []
    for w in way:
        if w.tag == 'nd':
            nodes.append(w.attrib['ref'])
    return nodes


def create_node(nodes, i):
    length = len(nodes)
    if i == 0:
        pre_node = None
        next_node = int(nodes[i])  # deleted +1
    elif i == length-1:
        pre_node = int(nodes[i-1])
        next_node = None
    else:
        pre_node = int(nodes[i-1])
        next_node = int(nodes[i+1])
    return pre_node, nodes[i], next_node


def create_data_info(current_node):
    lat, lon = node_info[current_node]['lat'], node_info[current_node]['lon']
    data[current_node] = {'lat': lat, 'lon': lon, 'adj': [], 'w': []}


def add_nodes(nodes):
    length = len(nodes)
    for i in range(length):
        pre_node, current_node, next_node = create_node(nodes, i)
        if current_node not in data:
            create_data_info(current_node)
        if pre_node and pre_node not in data[current_node]['adj'] and str(current_node) != str(pre_node) and pre_node != next_node:
            data[current_node]['adj'].append(pre_node)
            data[current_node]['w'].append(randrange(9, 75))
        if next_node and next_node not in data[current_node]['adj'] and str(current_node) != str(next_node) and next_node != pre_node:
            data[current_node]['adj'].append(next_node)
            data[current_node]['w'].append(randrange(9, 75))


def create_nodes_info(node):
    node_id, lat, lon = node.attrib['id'], node.attrib['lat'], node.attrib['lon']
    node_info[node_id] = {'lat': float(lat), 'lon': float(lon)}


def store_json(data):
    with open('nodes.json', 'w') as f:
        f.write(json.dumps([data]))


def main():
    tree = ET.ElementTree(
        file='C:/Users/Dino/Desktop/pathfinding-master/tools/map.osm')
    root = tree.getroot()

    for child_root in root:
        if child_root.tag == 'node':
            create_nodes_info(child_root)

    for child_root in root:
        if child_root.tag == 'way':
            nodes = parse_way(child_root)
            add_nodes(nodes)

    store_json(data)


if __name__ == "__main__":
    main()

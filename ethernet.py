import struct
import socket
from socket import AddressFamily
import psutil
import netifaces


def get_ethernet_connections():
    addresses = psutil.net_if_addrs()
    stats = psutil.net_if_stats()

    ethernets = []
    print(addresses)
    for intface, addr_list in addresses.items():
        if any(getattr(addr, 'address').startswith("169.254") for addr in addr_list):
            continue
        elif intface in stats and intface.startswith('en') and getattr(stats[intface], "isup"):
            ethernets.append({
                "name": intface,
                "is_up": stats[intface].isup,
                "ip_address": next(map(lambda a: a.address, filter(lambda n: n.family == AddressFamily.AF_INET, addresses[intface])), None)
            })

    return None


def get_default_gateway():
    gateways = netifaces.gateways()
    if not gateways or not 'default' in gateways or not netifaces.AF_INET in gateways['default']:
        return None

    return gateways['default'][netifaces.AF_INET][0]


if __name__ == '__main__':
    print(get_ethernet_connections())
    print(get_default_gateway())

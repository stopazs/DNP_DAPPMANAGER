#!/bin/bash

# This script can install updates on the Avado host system.
# 
# We do this by first adding this script to /etc/rc.local and rebooting.
# This way this scripts really runs on the host without using docker sockets.

LOGFILE=/root/update/log.txt
date >> ${LOGFILE}

# Am I in RC.local already?
if [ ! -f /etc/rc.local ]; then
    echo "#!/bin/sh -e" >>/etc/rc.local
    echo "exit 0" >>/etc/rc.local
    chmod +x /etc/rc.local
    systemctl start rc-local
fi
if ! grep -q "updateAvadoHost.sh" "/etc/rc.local"; then
    echo "Adding updateAvadoHost.sh to /etc/rc.local" >> ${LOGFILE}
    sed -i '$i/root/update/updateAvadoHost.sh' /etc/rc.local
    # If geth is running, git it enough time to cleanly shut down
    docker stop DAppNodePackage-ethchain-geth.public.dappnode.eth -t 180
    # reboot
    reboot
    exit
fi

# We have now rebooted and are running on the host

# Check Docker update
DOCKER_VERSION=$(docker --version | sed -n "s/Docker version \([0-9\.]*\),.*/\1/p")
DEBIAN_CODENAME=$(lsb_release -c | cut -d ":" -f 2 | xargs) # buster or bullseye

echo -n "Check Docker update: " >> ${LOGFILE}
if dpkg --compare-versions "${DOCKER_VERSION}" "lt" "20.10.17"; then
    echo "Update required. Updating" >> ${LOGFILE}
    pushd /root/update/${DEBIAN_CODENAME}
    for pack in containerd.io_*.deb docker-ce-cli_*.deb docker-ce_*.deb; do #sequence is important
        dpkg -i ${pack}
    done
    popd
    echo "Update finished. Rebooting" >> ${LOGFILE}
    reboot
else
    echo "OK" >> ${LOGFILE}
fi

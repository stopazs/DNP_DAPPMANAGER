#!/bin/sh

echo "server 172.33.1.2" > /tmp/nsupdate.txt
echo "debug yes" >> /tmp/nsupdate.txt
echo "zone eth." >> /tmp/nsupdate.txt
for container in $(docker inspect -f '{{.Name}};{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q -f "name=DAppNodePackage-"))
do
    name=$(echo $container | awk -F ';' '{print $1}'| sed 's/DAppNodePackage-//g'| tr -d '/_')
    ip=$(echo $container | awk -F ';' '{print $2}'| tr -d '/_')
    if [ ! -z "$ip" ]
    then
    	echo "update delete my.${name} A" >> /tmp/nsupdate.txt
    	echo "update add my.${name} 60 A ${ip}" >> /tmp/nsupdate.txt
    fi
done
echo "show" >> /tmp/nsupdate.txt
echo "send" >> /tmp/nsupdate.txt

nsupdate -v /tmp/nsupdate.txt

echo "server 172.33.1.2" > /tmp/nsupdate_dappnode.txt
echo "debug yes" >> /tmp/nsupdate_dappnode.txt
echo "zone dappnode." >> /tmp/nsupdate_dappnode.txt
for container in $(docker inspect -f '{{.Name}};{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q -f "name=DAppNodePackage-"))
do
    name=$(echo $container | awk -F ';' '{print $1}'| sed 's/DAppNodePackage-//g'| sed 's/\.dappnode\.eth//g' |  sed 's/\.dnp//g' | tr -d '/_')
    ip=$(echo $container | awk -F ';' '{print $2}'| tr -d '/_')
    if [ ! -z "$ip" ]
    then
    	echo "update delete ${name}.dappnode A" >> /tmp/nsupdate_dappnode.txt
    	echo "update add ${name}.dappnode 60 A ${ip}" >> /tmp/nsupdate_dappnode.txt
    fi
done
echo "show" >> /tmp/nsupdate_dappnode.txt
echo "send" >> /tmp/nsupdate_dappnode.txt

nsupdate -v /tmp/nsupdate_dappnode.txt


echo "server 172.33.1.2" > /tmp/nsupdate_avado.txt
echo "debug yes" >> /tmp/nsupdate_avado.txt
echo "zone avado." >> /tmp/nsupdate_avado.txt
for container in $(docker inspect -f '{{.Name}};{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q -f "name=DAppNodePackage-"))
do
    name=$(echo $container | awk -F ';' '{print $1}'| sed 's/DAppNodePackage-//g'| sed 's/\.dappnode\.eth//g' |  sed 's/\.dnp//g' | tr -d '/_')
    ip=$(echo $container | awk -F ';' '{print $2}'| tr -d '/_')
    if [ ! -z "$ip" ]
    then
    	echo "update delete ${name}.avado A" >> /tmp/nsupdate_avado.txt
    	echo "update add ${name}.avado 60 A ${ip}" >> /tmp/nsupdate_avado.txt
    fi
done
echo "show" >> /tmp/nsupdate_avado.txt
echo "send" >> /tmp/nsupdate_avado.txt

nsupdate -v /tmp/nsupdate_avado.txt


echo "server 172.33.1.2" > /tmp/nsupdate_avadopackage_com.txt
echo "debug yes" >> /tmp/nsupdate_avadopackage_com.txt
echo "zone avadopackage.com." >> /tmp/nsupdate_avadopackage_com.txt
for container in $(docker inspect -f '{{.Name}};{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q -f "name=DAppNodePackage-"))
do
    name=$(echo $container | awk -F ';' '{print $1}'| sed 's/DAppNodePackage-//g'| sed 's/\.dappnode\.eth//g' |  sed 's/\.dnp//g' |  sed 's/\.public//g'|  sed 's/\.avado//g' | tr -d '/_')
    ip=$(echo $container | awk -F ';' '{print $2}'| tr -d '/_')
    if [ ! -z "$ip" ]
    then
    	echo "update delete ${name}.avadopackage.com A" >> /tmp/nsupdate_avadopackage_com.txt
    	echo "update add ${name}.avadopackage.com 60 A ${ip}" >> /tmp/nsupdate_avadopackage_com.txt
    fi
done
echo "show" >> /tmp/nsupdate_avadopackage_com.txt
echo "send" >> /tmp/nsupdate_avadopackage_com.txt

nsupdate -v /tmp/nsupdate_avadopackage_com.txt



echo "server 172.33.1.2" > /tmp/nsupdate_my.ava.do.txt
echo "debug yes" >> /tmp/nsupdate_my.ava.do.txt
echo "zone my.ava.do." >> /tmp/nsupdate_my.ava.do.txt
for container in $(docker inspect -f '{{.Name}};{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q -f "name=DAppNodePackage-"))
do
    name=$(echo $container | awk -F ';' '{print $1}'| sed 's/DAppNodePackage-//g'| sed 's/\.dappnode\.eth//g' |  sed 's/\.dnp//g' |  sed 's/\.public//g'|  sed 's/\.avado//g' | tr -d '/_')
    ip=$(echo $container | awk -F ';' '{print $2}'| tr -d '/_')
    if [ ! -z "$ip" ]
    then
    	echo "update delete ${name}.my.ava.do A" >> /tmp/nsupdate_my.ava.do.txt
    	echo "update add ${name}.my.ava.do 60 A ${ip}" >> /tmp/nsupdate_my.ava.do.txt
    fi
done
echo "show" >> /tmp/nsupdate_my.ava.do.txt
echo "send" >> /tmp/nsupdate_my.ava.do.txt

nsupdate -v /tmp/nsupdate_my.ava.do.txt
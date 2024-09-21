Initial Setup

Login ke azure environment dengan memanfaatkan public key yang sudah diunduh sebelumnya.
Masukan public key ke .SSH directory dan inisialisasi login untuk memasuki virtual environment azure.
tulis di git bash atau wsl anda untuk remote //menyeting VM yg sudah anda create dengan cli interface

Mv shidou.pem ~./ssh
ssh -i ~/.ssh/shidou.pem shidou@13.83.89.227
Setelah memasuki virtual environment azure, Anda dapat masuk melalui SSH di aplikasi terminal lokal yang ingin dipilih. Anda akan memiliki perintah di dashboard. Setelah masuk, hal pertama yang harus dilakukan adalah memperbarui server.
apt update && apt upgrade -y
APACHE Setup

Sekarang, kita bisa menginstal Apache dan mengatur situs web pertama kita. Masuk kembali ke server Anda melalui SSH, kali ini menggunakan nama pengguna alih-alih root. Kemudian ketik perintah di bawah ini untuk menginstal paket yang diperlukan, dan periksa untuk melihat apakah sudah berjalan.

sudo apt install apache2 apache2-docs apache2-utils
systemctl status apache2

Pada titik ini Anda dapat melihat apakah itu berfungsi pada browser web dan memeriksa untuk melihat apakah domain telah sepenuhnya dipaksakan jika Anda mengubah server nama apa pun. Cukup salin / tempel IP Anda ke bilah alamat browser web dan Anda akan melihat Halaman Default Apache2. Gunakan perintah di bawah ini untuk menonaktifkan situs web default, karena kita akan membuat direktori dan konfigurasi kita sendiri nanti.


Konfigurasi Apache server pada azure
sudo a2dissite 000-default.conf
sudo systemctl reload apache2
Config Firewall

Sekarang, kita perlu mengaktifkan dan mengizinkan beberapa aplikasi dengan firewall kita. Aplikasi firewall default di Ubuntu membuat ini sangat mudah dilakukan. Untuk melihat daftar aplikasi, cukup jalankan perintah di bawah ini.

sudo ufw app list
sudo ufw allow ‘Apache Full’
sudo ufw allow OpenSSH
Dari sini, mari aktifkan firewall kita dan periksa statusnya.

sudo ufw enable
sudo ufw status

konfigurasi Firewall pada web server
Membuat Website

Membuat direktori untuk situs web kami cukup mudah. Setup dilakukan di direktori default / var / www / html. Dengan perintah di bawah ini:

Pertama, buatlah folder buat web. Dalam proyek ini, kami membuat folder berjudul shidou.net dan diisi dengan public_html logs dan backup setelah itu, set apache akar terbind dengan path /var/www/html/shidou.net/public_html dengan cara
cd /etc/apache2/sites-available
sudo nano shidou.net.conf
Bagian ini diisi dengan

<VirtualHost *:80>
 ServerAdmin shidou@uwu.tv
 ServerName shidou.net
 ServerAlias www.shidou.net
 DocumentRoot /var/www/html/ shidou.net public_html/
 ErrorLog /var/www/html/ shidou.net /logs/error.log
 CustomLog /var/www/html/shidou.net/logs/access.log combined
</VirtualHost>
*catatan: ini adalah konfigurasi kami. Anda bisa menggunakan konfigurasi lain sesuai dengan kebutuhan dan selera Anda.

Sekarang, kita menjalankan beberapa perintah untuk mengaktifkan konfigurasi baru kita.
sudo a2ensite shidou.net
systemctl reload apache2

Setelah itu saya menambahkan index .html style .css dan script.js ke dalam path /var/www/html/ shidou.net public_html/
Berikut adalah hasil setelah mengisi bagian front end dari web kami


Installasi PHP

PHP adalah komponen setup kami yang bertugas untuk memproses kode yang menampilkan konten dinamis. Cara menginstallnya adalah dengan menjalankan perintah di bawah ini:


sudo apt-get install php libapache2-mod-php php-mcrypt php-mysql
Dalam kebanyakan kasus, kita ingin mengubah cara Apache menyajikan file ketika direktori diminta. Saat ini, jika pengguna meminta direktori dari server, Apache akan mencari file bernama index.html terlebih dahulu. Karena ingin agar server memilih file PHP (ekstensinya: .php), kami pun melakukan konfigurasi agar Apache mencari file index.php terlebih dahulu.

Untuk melakukannya, ketikkan perintah ini untuk membuka file dir.conf di editor teks dengan hak akses root. Kami ingin memindahkan file indeks PHP yang disorot di atas ke posisi pertama setelah spesifikasi DirectoryIndex, seperti ini:

sudo nano /etc/apache2/mods-enabled/dir.conf

Jika sudah selesai, simpan dan tutup file dengan menekan Ctrl-X. Anda harus mengkonfirmasi penyimpanan dengan mengetik Y lalu tekan Enter untuk mengonfirmasi lokasi penyimpanan file.
Setelah itu, kita menambahkan info.php ke dalam directory front end agar message pembuktian berhasil atau tidaknya instalasi php.

cd /var/www/html/shidou.net/public_html/
nano info.php
Dalam file info.php (pada aplikasi nano):

<?php
phpinfo
?>
Lalu ctrl + x dan enter lalu cek ke website interface apakah directory sudah ada atau belum
http://13.83.89.227/info.php


Jika muncul tampilan seperti gambar di atas, artinya PHP sudah terpasang.

Installasi MariaDB

Untuk penginstalan-nya dilakukan dengan menjalankan perintah berikut:
sudo apt install mariadb-server mariadb-client -y

Untuk memeriksa keberhasilan instalasi MariaDB, bisa dengan menjalankan perintah berikut:

mariadb — version
Jika muncul tulisan seperti pada gambar di bawah, itu berarti MariaDB berhasil terpasang.


Untuk melihat status apakah sedang berjalan atau tidak, kita bisa memeriksanya dengan menjalankan perintah systemctl status mariadb


Apabila tidak menyala, MariaDB bisa diaktifkan dengan perintah berikut:

sudo systemctl start mariadb
sudo systemctl enable mariadb
Mengecek database
Untuk login ke MariaDB, kita bisa menggunakan perintah berikut:

Sudo mariadb -u root -p
SHOW DATABASES;
Menu yang akan muncul akan seperti ini:


Dalam proyek kami, isi database bisa dilihat dengan menjalankan perintah berikut:

USE slot_machines;
SHOW TABLES;
DESCRIBE leaderboard;


Penutup

Dalam proyek ini, kami berhasil membuat dan mengkonfigurasi sebuah Virtual Machine (VM) di platform Azure, kemudian mengatur web server Apache dan firewall pada server Ubuntu, serta membuat dan mengkonfigurasi LAMP server sederhana. Menggunakan Frontend java script,css dan html walaupun untuk backend belum optimal seperti php dan database maria DB dikarenakan batasan pipeline dan api untuk ditembak serta ui yang terlalu sederhana karena ada filter bawaan pada azure pipeline yang dimana bisa memutuskan asset asset yang akan dibawa untuk menghias server kita.

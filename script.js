async function searchUser() {
    const user = document.getElementById('username').value;
    // Proxy AllOrigins versi paling stabil
    const proxy = "https://api.allorigins.win/get?url=";
    
    if (!user) return;
    document.getElementById('result').style.display = "block";
    
    try {
        // AMBIL DATA USER (Sengaja pakai API yang simpel biar gak loading)
        const targetUrl = encodeURIComponent(`https://users.roblox.com/v1/usernames/users`);
        
        // Menambahkan parameter di URL agar Proxy bisa baca (Metode GET)
        const response = await fetch(`${proxy}${targetUrl}%3Fusernames=${user}%26excludeBannedUsers=false`);
        const result = await response.json();
        const data = JSON.parse(result.contents);

        if (!data.data || data.data.length === 0) {
            alert("Username tidak ditemukan! Coba ketik yang benar.");
            return;
        }

        const userId = data.data[0].id;
        const realName = data.data[0].name;

        // AMBIL FOTO
        const thumbUrl = encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`);
        const thumbRes = await fetch(`${proxy}${thumbUrl}`);
        const thumbDataRaw = await thumbRes.json();
        const thumbData = JSON.parse(thumbDataRaw.contents);

        // UPDATE TAMPILAN
        document.getElementById('avatar').src = thumbData.data[0].imageUrl;
        document.getElementById('displayName').innerText = data.data[0].displayName;
        document.getElementById('userName').innerText = `@${realName}`;
        document.getElementById('userBio').innerText = "Account Found!";

        // LOGIKA BADGE SPESIAL
        const label = document.getElementById('special-label');
        const lowName = realName.toLowerCase();
        
        if (lowName === "vitofromid") {
            label.innerHTML = '<span class="badge-vito">Owner 👑</span>';
        } else if (lowName === "isskka44") {
            label.innerHTML = '<span class="badge-pacar">My Pretty Girl ❤️✨</span>';
        } else {
            label.innerHTML = '';
        }

    } catch (e) {
        console.error(e);
        alert("Gagal ambil data, coba klik cari lagi!");
    }
}

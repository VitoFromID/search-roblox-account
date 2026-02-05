async function searchUser() {
    const user = document.getElementById('username').value;
    const proxy = "https://api.allorigins.win/get?url=";
    
    if (!user) return;
    document.getElementById('result').style.display = "block";
    
    try {
        // Ambil data user
        const targetUrl = encodeURIComponent(`https://users.roblox.com/v1/usernames/users`);
        const payload = { usernames: [user], excludeBannedUsers: false };
        
        const response = await fetch(`${proxy}${targetUrl}&body=${JSON.stringify(payload)}`);
        const result = await response.json();
        const data = JSON.parse(result.contents);

        if (!data.data || data.data.length === 0) {
            alert("Username tidak ditemukan di Roblox.");
            return;
        }

        const userId = data.data[0].id;
        const realName = data.data[0].name;

        // Ambil Foto & Detail Deskripsi
        const thumbUrl = encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`);
        const detailUrl = encodeURIComponent(`https://users.roblox.com/v1/users/${userId}`);

        const [tRes, dRes] = await Promise.all([
            fetch(`${proxy}${thumbUrl}`).then(r => r.json()),
            fetch(`${proxy}${detailUrl}`).then(r => r.json())
        ]);

        const tData = JSON.parse(tRes.contents);
        const dData = JSON.parse(dRes.contents);

        // Update Tampilan
        document.getElementById('avatar').src = tData.data[0].imageUrl;
        document.getElementById('displayName').innerText = data.data[0].displayName;
        document.getElementById('userName').innerText = `@${realName}`;
        document.getElementById('userBio').innerText = dData.description || "No Bio.";

        // Badge Spesial
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
        alert("Server sibuk, coba klik 'Cari' lagi.");
    }
}

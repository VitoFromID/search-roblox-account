async function searchUser() {
    const user = document.getElementById('username').value;
    // Proxy paling kuat untuk tembus blokir
    const proxy = "https://corsproxy.io/?";
    
    if (!user) return;
    document.getElementById('result').style.display = "block";
    
    try {
        // AMBIL DATA USER
        const userUrl = encodeURIComponent(`https://users.roblox.com/v1/usernames/users`);
        const response = await fetch(`${proxy}${userUrl}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [user], excludeBannedUsers: false })
        });
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            alert("Username tidak ditemukan!");
            return;
        }

        const userId = data.data[0].id;
        const realName = data.data[0].name;

        // AMBIL FOTO & DETAIL
        const thumbUrl = encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`);
        const detailUrl = encodeURIComponent(`https://users.roblox.com/v1/users/${userId}`);

        const [tRes, dRes] = await Promise.all([
            fetch(`${proxy}${thumbUrl}`).then(r => r.json()),
            fetch(`${proxy}${detailUrl}`).then(r => r.json())
        ]);

        // UPDATE TAMPILAN
        document.getElementById('avatar').src = tRes.data[0].imageUrl;
        document.getElementById('displayName').innerText = data.data[0].displayName;
        document.getElementById('userName').innerText = `@${realName}`;
        document.getElementById('userBio').innerText = dRes.description || "I really love my gf.";

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
        alert("Server sibuk, klik Cari sekali lagi!");
    }
}

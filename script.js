async function searchUser() {
    const user = document.getElementById('username').value;
    const proxy = "https://corsproxy.io/?";
    
    if (!user) {
        alert("Masukkan username dulu!");
        return;
    }
    
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
            document.getElementById('result').style.display = "none";
            return;
        }

        const userId = data.data[0].id;
        const realName = data.data[0].name;

        // AMBIL FOTO, DETAIL, & WEARING
        const thumbUrl = encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`);
        const detailUrl = encodeURIComponent(`https://users.roblox.com/v1/users/${userId}`);
        const avatarUrl = encodeURIComponent(`https://avatar.roblox.com/v1/users/${userId}/currently-wearing`);

        const [tRes, dRes, aRes] = await Promise.all([
            fetch(`${proxy}${thumbUrl}`).then(r => r.json()),
            fetch(`${proxy}${detailUrl}`).then(r => r.json()),
            fetch(`${proxy}${avatarUrl}`).then(r => r.json())
        ]);

        // UPDATE TAMPILAN
        document.getElementById('avatar').src = tRes.data[0].imageUrl;
        document.getElementById('displayName').innerText = data.data[0].displayName;
        document.getElementById('userName').innerText = `@${realName}`;
        document.getElementById('userBio').innerText = dRes.description || "I really love my gf.";

        // STATS GRID
        const created = new Date(dRes.created).toLocaleDateString('id-ID');
        document.getElementById('stats').innerHTML = `
            <div><strong>User ID:</strong> ${userId}</div>
            <div><strong>Banned:</strong> ${dRes.isBanned ? "Yes" : "No"}</div>
            <div><strong>Created:</strong> ${created}</div>
            <div><strong>Verified:</strong> ${dRes.hasVerifiedBadge ? "✓" : "✗"}</div>
        `;

        // WEARING ITEMS
        const accessories = aRes.assetIds || [];
        const accList = document.getElementById('accessory-list');
        
        if (accessories.length === 0) {
            accList.innerHTML = '<p style="grid-column: 1/-1; color: #666; font-size: 12px;">Tidak ada item</p>';
        } else {
            const items = accessories.slice(0, 8); // ambil max 8 item
            const thumbIds = items.join(',');
            const itemThumbUrl = encodeURIComponent(`https://thumbnails.roblox.com/v1/assets?assetIds=${thumbIds}&size=150x150&format=Png`);
            
            const itemRes = await fetch(`${proxy}${itemThumbUrl}`).then(r => r.json());
            
            accList.innerHTML = itemRes.data.map(item => 
                `<div class="item-card"><img src="${item.imageUrl}" class="acc-img" alt="Item"></div>`
            ).join('');
        }

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
        console.error("Error:", e);
        alert("Gagal memuat data. Coba lagi!");
        document.getElementById('result').style.display = "none";
    }
}

// EFEK PARTIKEL
function createParticles() {
    const container = document.getElementById('particles-container');
    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = particle.style.height = (Math.random() * 4 + 2) + 'px';
        particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
        container.appendChild(particle);
        setTimeout(() => particle.remove(), 7000);
    }, 300);
}

createParticles();

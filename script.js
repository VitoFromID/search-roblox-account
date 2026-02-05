async function searchUser() {
    const user = document.getElementById('username').value.trim();
    
    if (!user) {
        alert("Masukkan username dulu!");
        return;
    }
    
    // Tampilkan loading
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = "block";
    resultDiv.innerHTML = '<p style="text-align:center; color:#00fbff;">Loading...</p>';
    
    // COBA BEBERAPA PROXY (fallback system)
    const proxies = [
        "https://api.allorigins.win/raw?url=",
        "https://corsproxy.io/?",
        "https://api.codetabs.com/v1/proxy?quest="
    ];
    
    let success = false;
    
    for (let proxy of proxies) {
        try {
            console.log(`Mencoba proxy: ${proxy}`);
            
            // AMBIL DATA USER
            const userUrl = `https://users.roblox.com/v1/usernames/users`;
            const response = await fetch(`${proxy}${encodeURIComponent(userUrl)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usernames: [user], excludeBannedUsers: false })
            });
            
            const data = await response.json();

            if (!data.data || data.data.length === 0) {
                alert("Username tidak ditemukan!");
                resultDiv.style.display = "none";
                return;
            }

            const userId = data.data[0].id;
            const realName = data.data[0].name;
            const displayName = data.data[0].displayName;

            // AMBIL FOTO, DETAIL, & WEARING
            const thumbUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`;
            const detailUrl = `https://users.roblox.com/v1/users/${userId}`;
            const avatarUrl = `https://avatar.roblox.com/v1/users/${userId}/currently-wearing`;

            const [tRes, dRes, aRes] = await Promise.all([
                fetch(`${proxy}${encodeURIComponent(thumbUrl)}`).then(r => r.json()),
                fetch(`${proxy}${encodeURIComponent(detailUrl)}`).then(r => r.json()),
                fetch(`${proxy}${encodeURIComponent(avatarUrl)}`).then(r => r.json())
            ]);

            // RENDER PROFILE CARD
            renderProfile(tRes, dRes, aRes, userId, realName, displayName, proxy);
            success = true;
            break; // Keluar dari loop jika berhasil
            
        } catch (e) {
            console.error(`Proxy ${proxy} gagal:`, e);
            continue; // Coba proxy berikutnya
        }
    }
    
    if (!success) {
        alert("Semua server gagal! Cek koneksi internet atau coba lagi nanti.");
        resultDiv.style.display = "none";
    }
}

async function renderProfile(tRes, dRes, aRes, userId, realName, displayName, proxy) {
    const resultDiv = document.getElementById('result');
    
    // Ambil data
    const avatarImg = tRes.data?.[0]?.imageUrl || 'https://via.placeholder.com/150';
    const bio = dRes.description || "I really love my gf.";
    const created = new Date(dRes.created).toLocaleDateString('id-ID');
    const isBanned = dRes.isBanned ? "Yes ❌" : "No ✅";
    const verified = dRes.hasVerifiedBadge ? "✅" : "❌";
    
    // Badge spesial
    let badge = '';
    const lowName = realName.toLowerCase();
    if (lowName === "vitofromid") {
        badge = '<span class="badge-vito">Owner 👑</span>';
    } else if (lowName === "isskka44") {
        badge = '<span class="badge-pacar">My Pretty Girl ❤️✨</span>';
    }
    
    // Wearing items
    const accessories = aRes.assetIds || [];
    let itemsHTML = '';
    
    if (accessories.length === 0) {
        itemsHTML = '<p style="grid-column: 1/-1; color: #666; font-size: 12px; text-align: center;">Tidak ada item</p>';
    } else {
        const items = accessories.slice(0, 8);
        const thumbIds = items.join(',');
        const itemThumbUrl = `https://thumbnails.roblox.com/v1/assets?assetIds=${thumbIds}&size=150x150&format=Png`;
        
        try {
            const itemRes = await fetch(`${proxy}${encodeURIComponent(itemThumbUrl)}`).then(r => r.json());
            itemsHTML = itemRes.data.map(item => 
                `<div class="item-card"><img src="${item.imageUrl}" class="acc-img" alt="Item"></div>`
            ).join('');
        } catch (e) {
            itemsHTML = '<p style="grid-column: 1/-1; color: #666; font-size: 12px;">Gagal load items</p>';
        }
    }
    
    // Render HTML
    resultDiv.innerHTML = `
        <div id="special-label">${badge}</div>
        <div class="avatar-wrap">
            <div class="neon-ring"></div>
            <img id="avatar" src="${avatarImg}" alt="Avatar">
        </div>
        <h2 id="displayName">${displayName}</h2>
        <p id="userName">@${realName}</p>
        <p id="userBio" class="bio-text">${bio}</p>
        
        <div id="stats" class="stats-grid">
            <div><strong>User ID:</strong> ${userId}</div>
            <div><strong>Banned:</strong> ${isBanned}</div>
            <div><strong>Created:</strong> ${created}</div>
            <div><strong>Verified:</strong> ${verified}</div>
        </div>

        <h3 class="line-title">Wearing</h3>
        <div id="accessory-list" class="item-grid">${itemsHTML}</div>
        
        <h3 class="line-title">Favorite Maps</h3>
        <div class="maintenance-box">🚧 Fitur Map Favorit (Maintenance)</div>
    `;
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

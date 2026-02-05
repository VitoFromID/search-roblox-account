async function searchUser() {
    const user = document.getElementById('username').value.trim();
    
    if (!user) {
        alert("Masukkan username dulu!");
        return;
    }
    
    // Tampilkan loading
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = "block";
    resultDiv.innerHTML = '<p style="text-align:center; color:#00fbff; padding: 40px;">⏳ Loading...</p>';
    
    try {
        // AMBIL DATA USER (langsung tanpa proxy)
        const response = await fetch(`https://users.roblox.com/v1/usernames/users`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                usernames: [user], 
                excludeBannedUsers: false 
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            alert("Username tidak ditemukan!");
            resultDiv.style.display = "none";
            return;
        }

        const userId = data.data[0].id;
        const realName = data.data[0].name;
        const displayName = data.data[0].displayName;

        // AMBIL SEMUA DATA SEKALIGUS
        const [thumbData, detailData, wearingData] = await Promise.all([
            fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`)
                .then(r => r.json()),
            fetch(`https://users.roblox.com/v1/users/${userId}`)
                .then(r => r.json()),
            fetch(`https://avatar.roblox.com/v1/users/${userId}/currently-wearing`)
                .then(r => r.json())
        ]);

        // RENDER PROFILE
        await renderProfile(thumbData, detailData, wearingData, userId, realName, displayName);
        
    } catch (error) {
        console.error("Error:", error);
        
        // Pesan error yang lebih friendly
        let errorMsg = "Gagal memuat data!";
        if (error.message.includes("Failed to fetch")) {
            errorMsg = "Koneksi internet bermasalah atau Roblox API sedang down. Coba lagi!";
        } else if (error.message.includes("HTTP 429")) {
            errorMsg = "Terlalu banyak request! Tunggu 10 detik lalu coba lagi.";
        }
        
        alert(errorMsg);
        resultDiv.style.display = "none";
    }
}

async function renderProfile(tRes, dRes, aRes, userId, realName, displayName) {
    const resultDiv = document.getElementById('result');
    
    // Ambil data dengan fallback
    const avatarImg = tRes.data?.[0]?.imageUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect fill="%23111"/><text x="50%" y="50%" fill="%2300fbff" text-anchor="middle" dy=".3em" font-size="60">?</text></svg>';
    const bio = dRes.description || "No bio available.";
    const created = new Date(dRes.created).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
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
        itemsHTML = '<p style="grid-column: 1/-1; color: #666; font-size: 12px; text-align: center; padding: 20px;">No items equipped</p>';
    } else {
        try {
            const items = accessories.slice(0, 8);
            const thumbIds = items.join(',');
            const itemRes = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${thumbIds}&size=150x150&format=Png`)
                .then(r => r.json());
            
            itemsHTML = itemRes.data.map(item => 
                `<div class="item-card">
                    <img src="${item.imageUrl}" class="acc-img" alt="Item" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22150%22><rect fill=%22%23222%22/></svg>'">
                </div>`
            ).join('');
        } catch (e) {
            console.error("Failed to load items:", e);
            itemsHTML = '<p style="grid-column: 1/-1; color: #666; font-size: 12px; text-align: center;">Failed to load items</p>';
        }
    }
    
    // Render HTML
    resultDiv.innerHTML = `
        ${badge ? `<div style="margin-bottom: 15px;">${badge}</div>` : ''}
        <div class="avatar-wrap">
            <div class="neon-ring"></div>
            <img id="avatar" src="${avatarImg}" alt="Avatar" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22150%22><rect fill=%22%23000%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22%2300fbff%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2260%22>?</text></svg>'">
        </div>
        <h2 id="displayName">${displayName}</h2>
        <p id="userName">@${realName}</p>
        <p class="bio-text">${bio}</p>
        
        <div class="stats-grid">
            <div><strong>User ID</strong><br>${userId}</div>
            <div><strong>Banned</strong><br>${isBanned}</div>
            <div><strong>Created</strong><br>${created}</div>
            <div><strong>Verified</strong><br>${verified}</div>
        </div>

        <h3 class="line-title">💎 Wearing</h3>
        <div class="item-grid">${itemsHTML}</div>
        
        <h3 class="line-title">🎮 Favorite Games</h3>
        <div class="maintenance-box">🚧 Coming Soon</div>
    `;
}

// EFEK PARTIKEL
function createParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    setInterval(() => {
        if (document.querySelectorAll('.particle').length > 20) return; // Limit particles
        
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        const size = Math.random() * 4 + 2;
        particle.style.width = particle.style.height = size + 'px';
        particle.style.animationDuration = (Math.random() * 3 + 4) + 's';
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 7000);
    }, 300);
}

// Start particles when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createParticles);
} else {
    createParticles();
            }

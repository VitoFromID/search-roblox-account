async function searchUser() {
    const user = document.getElementById('username').value;
    // Menggunakan proxy yang lebih stabil untuk API Roblox
    const proxy = "https://api.allorigins.win/raw?url=";
    
    if (!user) {
        alert("Masukkan username dulu!");
        return;
    }
    
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = "block";
    resultDiv.style.opacity = "0.5"; // Efek loading

    try {
        // 1. AMBIL DATA USER ID
        // Kita pakai method GET ke users.roblox.com/v1/users/search karena lebih ramah proxy
        const userSearchUrl = `https://users.roblox.com/v1/users/search?keyword=${user}&limit=10`;
        const userRes = await fetch(`${proxy}${encodeURIComponent(userSearchUrl)}`);
        const userData = await userRes.json();

        if (!userData.data || userData.data.length === 0) {
            alert("Username tidak ditemukan!");
            resultDiv.style.display = "none";
            return;
        }

        // Cari yang paling mirip (index 0)
        const targetUser = userData.data[0];
        const userId = targetUser.id;

        // 2. AMBIL FOTO, DETAIL, DAN AKSESORI (WEARING)
        const thumbUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`;
        const detailUrl = `https://users.roblox.com/v1/users/${userId}`;
        const appearanceUrl = `https://avatar.roblox.com/v1/users/${userId}/currently-wearing`;

        const [tRes, dRes, aRes] = await Promise.all([
            fetch(`${proxy}${encodeURIComponent(thumbUrl)}`).then(r => r.json()),
            fetch(`${proxy}${encodeURIComponent(detailUrl)}`).then(r => r.json()),
            fetch(`${proxy}${encodeURIComponent(appearanceUrl)}`).then(r => r.json())
        ]);

        // 3. UPDATE TAMPILAN PROFIL
        document.getElementById('avatar').src = tRes.data[0].imageUrl;
        document.getElementById('displayName').innerText = targetUser.displayName;
        document.getElementById('userName').innerText = `@${targetUser.name}`;
        document.getElementById('userBio').innerText = dRes.description || "No bio available.";

        // 4. LOGIKA BADGE SPESIAL
        const label = document.getElementById('special-label');
        const lowName = targetUser.name.toLowerCase();
        
        if (lowName === "vitofromid") {
            label.innerHTML = '<span class="badge-vito">Owner 👑</span>';
        } else if (lowName === "isskka44") {
            label.innerHTML = '<span class="badge-pacar">My Pretty Girl ❤️✨</span>';
        } else {
            label.innerHTML = '';
        }

        // 5. UPDATE DATA STATS (Joined, ID, dll)
        const date = new Date(dRes.created);
        const joinedDate = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('stats').innerHTML = `
            <div><strong>User ID:</strong><br>${userId}</div>
            <div><strong>Joined:</strong><br>${joinedDate}</div>
            <div><strong>Status:</strong><br>${dRes.isBanned ? 'Banned ❌' : 'Active ✅'}</div>
        `;

        // 6. TAMPILKAN AKSESORI (WEARING)
        const accList = document.getElementById('accessory-list');
        accList.innerHTML = ""; // Kosongkan dulu
        
        if (aRes.assetIds && aRes.assetIds.length > 0) {
            // Ambil 8 item pertama saja agar tidak penuh
            aRes.assetIds.slice(0, 8).forEach(assetId => {
                const imgUrl = `https://www.roblox.com/asset-thumbnail/image?assetId=${assetId}&width=150&height=150&format=png`;
                const itemHtml = `
                    <div class="item-card">
                        <img src="${imgUrl}" class="acc-img" alt="item">
                    </div>
                `;
                accList.innerHTML += itemHtml;
            });
        } else {
            accList.innerHTML = "<p style='font-size:10px; color:#666;'>Tidak memakai aksesori publik.</p>";
        }

        resultDiv.style.opacity = "1";

    } catch (e) {
        console.error(e);
        alert("Gagal mengambil data. Coba lagi atau username salah.");
        resultDiv.style.opacity = "1";
    }
    }

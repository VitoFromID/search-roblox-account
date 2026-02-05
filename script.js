async function searchUser() {
    const user = document.getElementById('username').value;
    // Menggunakan proxy AllOrigins yang lebih stabil untuk bypass CORS
    const proxy = "https://api.allorigins.win/raw?url=";
    
    if (!user) {
        alert("Masukkan username dulu!");
        return;
    }
    
    const resultDiv = document.getElementById('result');
    const statsDiv = document.getElementById('stats');
    const accList = document.getElementById('accessory-list');
    
    // Tampilkan box dan beri efek loading
    resultDiv.style.display = "block";
    resultDiv.style.opacity = "0.6";

    try {
        // 1. CARI USER ID BERDASARKAN USERNAME
        const searchUrl = `https://users.roblox.com/v1/users/search?keyword=${user}&limit=1`;
        const searchRes = await fetch(`${proxy}${encodeURIComponent(searchUrl)}`);
        const searchData = await searchRes.json();

        if (!searchData.data || searchData.data.length === 0) {
            alert("Username tidak ditemukan!");
            resultDiv.style.display = "none";
            return;
        }

        const userId = searchData.data[0].id;
        const displayName = searchData.data[0].displayName;
        const realName = searchData.data[0].name;

        // 2. AMBIL DATA DETAIL, AVATAR, DAN ITEM YANG DIPAKAI
        const detailUrl = `https://users.roblox.com/v1/users/${userId}`;
        const thumbUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`;
        const wearUrl = `https://avatar.roblox.com/v1/users/${userId}/currently-wearing`;

        const [dRes, tRes, wRes] = await Promise.all([
            fetch(`${proxy}${encodeURIComponent(detailUrl)}`).then(r => r.json()),
            fetch(`${proxy}${encodeURIComponent(thumbUrl)}`).then(r => r.json()),
            fetch(`${proxy}${encodeURIComponent(wearUrl)}`).then(r => r.json())
        ]);

        // 3. UPDATE TAMPILAN PROFIL
        document.getElementById('avatar').src = tRes.data[0].imageUrl;
        document.getElementById('displayName').innerText = displayName;
        document.getElementById('userName').innerText = `@${realName}`;
        document.getElementById('userBio').innerText = dRes.description || "No bio description.";

        // 4. UPDATE STATS (ID, TANGGAL JOIN, STATUS)
        const joinDate = new Date(dRes.created).toLocaleDateString('id-ID', { 
            year: 'numeric', month: 'long', day: 'numeric' 
        });
        
        statsDiv.innerHTML = `
            <div><strong>User ID:</strong><br>${userId}</div>
            <div><strong>Joined:</strong><br>${joinDate}</div>
            <div><strong>Account:</strong><br>${dRes.isBanned ? 'Banned ❌' : 'Safe ✅'}</div>
            <div><strong>Verified:</strong><br>${dRes.hasVerifiedBadge ? 'Yes ☑️' : 'No'}</div>
        `;

        // 5. UPDATE ITEM "WEARING" (MENGAMBIL GAMBAR ITEM)
        accList.innerHTML = "";
        if (wRes.assetIds && wRes.assetIds.length > 0) {
            wRes.assetIds.slice(0, 8).forEach(id => {
                const itemImg = `https://www.roblox.com/asset-thumbnail/image?assetId=${id}&width=150&height=150&format=png`;
                accList.innerHTML += `
                    <div class="item-card">
                        <img src="${itemImg}" class="acc-img">
                    </div>`;
            });
        } else {
            accList.innerHTML = "<p style='grid-column: span 4; font-size: 11px;'>No public items.</p>";
        }

        // 6. LOGIKA BADGE KHUSUS
        const label = document.getElementById('special-label');
        const lowName = realName.toLowerCase();
        if (lowName === "vitofromid") {
            label.innerHTML = '<span class="badge-vito">Owner 👑</span>';
        } else if (lowName === "isskka44") {
            label.innerHTML = '<span class="badge-pacar">My Pretty Girl ❤️✨</span>';
        } else {
            label.innerHTML = '';
        }

        resultDiv.style.opacity = "1";

    } catch (error) {
        console.error(error);
        alert("Gagal memuat data. Coba klik Cari lagi!");
        resultDiv.style.opacity = "1";
    }
            }

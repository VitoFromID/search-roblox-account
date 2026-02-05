function createParticles() {
    const container = document.getElementById('particles-container');
    setInterval(() => {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 4 + 2 + 'px';
        particle.style.width = size;
        particle.style.height = size;
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDuration = Math.random() * 3 + 4 + 's';
        container.appendChild(particle);
        setTimeout(() => { particle.remove(); }, 7000);
    }, 250);
}
createParticles();

async function searchUser() {
    const user = document.getElementById('username').value;
    // PAKAI PROXY ALLORIGINS (LEBIH STABIL)
    const proxy = "https://api.allorigins.win/get?url=";
    
    if (!user) return;
    document.getElementById('result').style.display = "block";
    
    try {
        // Ambil data User ID
        const targetUrl = encodeURIComponent("https://users.roblox.com/v1/usernames/users");
        const res = await fetch(`${proxy}${targetUrl}`, {
            method: 'GET' // AllOrigins bekerja lebih baik dengan GET untuk bypass CORS
        });
        const proxyData = await res.json();
        const data = JSON.parse(proxyData.contents); // AllOrigins membungkus data dalam 'contents'
        
        if (!data.data || data.data.length === 0) {
            alert("User tidak ditemukan!");
            return;
        }

        const userId = data.data[0].id;
        const realName = data.data[0].name;

        // Fungsi bantu untuk fetch lewat proxy
        const fetchRoblox = async (path) => {
            const r = await fetch(`${proxy}${encodeURIComponent(path)}`);
            const d = await r.json();
            return JSON.parse(d.contents);
        };

        const [detail, thumb, wear, friend, follow, following] = await Promise.all([
            fetchRoblox(`https://users.roblox.com/v1/users/${userId}`),
            fetchRoblox(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`),
            fetchRoblox(`https://avatar.roblox.com/v1/users/${userId}/currently-wearing`),
            fetchRoblox(`https://friends.roblox.com/v1/users/${userId}/friends/count`),
            fetchRoblox(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
            fetchRoblox(`https://friends.roblox.com/v1/users/${userId}/followings/count`)
        ]);

        document.getElementById('avatar').src = thumb.data[0].imageUrl;
        document.getElementById('displayName').innerText = data.data[0].displayName;
        document.getElementById('userName').innerText = `@${realName}`;
        document.getElementById('userBio').innerText = detail.description || "I really love my gf.";

        // BADGE SPESIAL
        const label = document.getElementById('special-label');
        const lowName = realName.toLowerCase();
        
        if (lowName === "vitofromid") {
            label.innerHTML = '<span class="badge-vito">Owner 👑</span>';
        } else if (lowName === "isskka44") {
            label.innerHTML = '<span class="badge-pacar">My Pretty Girl ❤️✨</span>';
        } else {
            label.innerHTML = '';
        }

        const age = Math.floor((new Date() - new Date(detail.created)) / (1000 * 60 * 60 * 24));
        document.getElementById('stats').innerHTML = `
            <div>👥 Friends: ${friend.count}</div>
            <div>📈 Followers: ${follow.count}</div>
            <div>👣 Following: ${following.count}</div>
            <div>📅 Age: ${age} Days</div>
        `;

        const accList = document.getElementById('accessory-list');
        accList.innerHTML = "";
        if (wear.assetIds && wear.assetIds.length > 0) {
            const aRes = await fetchRoblox(`https://thumbnails.roblox.com/v1/assets?assetIds=${wear.assetIds.join(',')}&size=150x150&format=Png`);
            wear.assetIds.forEach((id, index) => {
                if(aRes.data && aRes.data[index]) {
                    accList.innerHTML += `<a href="https://www.roblox.com/catalog/${id}" target="_blank" class="item-card"><img src="${aRes.data[index].imageUrl}" class="acc-img"></a>`;
                }
            });
        }
    } catch (e) { 
        console.error(e);
        alert("Gagal ambil data, coba refresh halaman!");
    }
                   }

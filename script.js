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
    // PROXY BARU AGAR TIDAK LOADING TERUS
    const proxy = "https://api.allorigins.win/raw?url=";
    
    if (!user) return;
    document.getElementById('result').style.display = "block";
    
    try {
        const res = await fetch(proxy + encodeURIComponent("https://users.roblox.com/v1/usernames/users"), {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernames: [user], excludeBannedUsers: false })
        });
        const data = await res.json();
        
        if (!data.data || data.data.length === 0) {
            alert("User tidak ditemukan!");
            return;
        }

        const userId = data.data[0].id;
        const realName = data.data[0].name;

        // Ambil data detail, foto, dan baju pakai proxy baru
        const [detail, thumb, wear, friend, follow, following] = await Promise.all([
            fetch(proxy + encodeURIComponent(`https://users.roblox.com/v1/users/${userId}`)).then(r => r.json()),
            fetch(proxy + encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`)).then(r => r.json()),
            fetch(proxy + encodeURIComponent(`https://avatar.roblox.com/v1/users/${userId}/currently-wearing`)).then(r => r.json()),
            fetch(proxy + encodeURIComponent(`https://friends.roblox.com/v1/users/${userId}/friends/count`)).then(r => r.json()),
            fetch(proxy + encodeURIComponent(`https://friends.roblox.com/v1/users/${userId}/followers/count`)).then(r => r.json()),
            fetch(proxy + encodeURIComponent(`https://friends.roblox.com/v1/users/${userId}/followings/count`)).then(r => r.json())
        ]);

        document.getElementById('avatar').src = thumb.data[0].imageUrl;
        document.getElementById('displayName').innerText = data.data[0].displayName;
        document.getElementById('userName').innerText = `@${realName}`;
        document.getElementById('userBio').innerText = detail.description || "I really love my gf.";

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
            const aRes = await fetch(proxy + encodeURIComponent(`https://thumbnails.roblox.com/v1/assets?assetIds=${wear.assetIds.join(',')}&size=150x150&format=Png`)).then(r => r.json());
            wear.assetIds.forEach((id, index) => {
                if(aRes.data && aRes.data[index]) {
                    accList.innerHTML += `<a href="https://www.roblox.com/catalog/${id}" target="_blank" class="item-card"><img src="${aRes.data[index].imageUrl}" class="acc-img"></a>`;
                }
            });
        }
    } catch (e) { 
        console.error(e);
        alert("Gagal ambil data, coba lagi!");
    }
}

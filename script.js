// Partikel latar belakang
function createParticles() {
    const container = document.getElementById('particles-container');
    if(!container) return;
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
    // Proxy AllOrigins yang lebih simpel
    const proxy = "https://api.allorigins.win/get?url=";
    
    if (!user) return;
    document.getElementById('result').style.display = "block";
    
    try {
        // Step 1: Cari User ID
        const userUrl = encodeURIComponent(`https://users.roblox.com/v1/usernames/users`);
        const response = await fetch(`${proxy}${userUrl}&body=${JSON.stringify({usernames:[user],excludeBannedUsers:false})}`);
        const result = await response.json();
        const data = JSON.parse(result.contents);

        if (!data.data || data.data.length === 0) {
            alert("User tidak ditemukan di Roblox!");
            return;
        }

        const userId = data.data[0].id;
        const realName = data.data[0].name;

        // Step 2: Ambil semua data sekaligus (Avatar & Detail)
        const thumbUrl = encodeURIComponent(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png`);
        const detailUrl = encodeURIComponent(`https://users.roblox.com/v1/users/${userId}`);

        const [thumbRes, detailRes] = await Promise.all([
            fetch(`${proxy}${thumbUrl}`).then(r => r.json()),
            fetch(`${proxy}${detailUrl}`).then(r => r.json())
        ]);

        const thumbData = JSON.parse(thumbRes.contents);
        const detailData = JSON.parse(detailRes.contents);

        // Update tampilan
        document.getElementById('avatar').src = thumbData.data[0].imageUrl;
        document.getElementById('displayName').innerText = data.data[0].displayName;
        document.getElementById('userName').innerText = `@${realName}`;
        document.getElementById('userBio').innerText = detailData.description || "No Bio.";

        // Logika Badge Spesial
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
        alert("Koneksi error, coba tekan 'Cari' lagi!");
    }
}

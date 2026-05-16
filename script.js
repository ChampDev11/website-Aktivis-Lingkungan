const SANDI_RAHASIA = "smanggesjuara";
let isAdminActive = false; 

// KONFIGURASI KONEKSI DATABASE CLOUD ONLINE NYATA (SANGAT AKURAT)
const SUPABASE_URL = "https://supabase.co";
const SUPABASE_KEY = "sb_publishable_ij-0EhiuMECCnr0znjWSgg_AyahmFKF";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", function() {
    tampilkanFotoDariDatabase();
    tampilkanAspirasiDariDatabase();
});

function cekSandi() {
    const inputUser = document.getElementById("input-sandi").value;
    const boxSandi = document.getElementById("password-box");
    const tombolUpload = document.getElementById("area-upload-terkunci");
    const pesanError = document.getElementById("pesan-error");

    if (inputUser === SANDI_RAHASIA) {
        isAdminActive = true; 
        boxSandi.style.display = "none";
        tombolUpload.style.display = "block";
        tampilkanFotoDariDatabase();
        tampilkanAspirasiDariDatabase();
    } else {
        pesanError.style.display = "block";
    }
}

// 📸 KONEKSI ONLINE: UNGGAH FOTO & TEKS KE DATABASE CLOUD
function unggahFoto() {
    const fileInput = document.getElementById("pilih-foto");
    const teksInput = document.getElementById("deskripsi-foto").value;
    
    if (fileInput.files.length === 0) {
        alert("Silakan pilih berkas foto kegiatan terlebih dahulu!");
        return;
    }
    if (teksInput.trim() === "") {
        alert("Silakan isi teks keterangan foto kegiatan terlebih dahulu!");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(e) {
        const img = new Image();
        img.onload = async function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const max_width = 500; 
            const scale = max_width / img.width;
            canvas.width = max_width;
            canvas.height = img.height * scale;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const gambarRinganBase64 = canvas.toDataURL('image/jpeg', 0.6);

            // MEMASUKKAN DATA SECARA REALTIME KE INTERNET
            const { error } = await supabase
                .from('wadah_foto_v2')
                .insert([{ foto: gambarRinganBase64, deskripsi: teksInput }]);

            if (error) {
                alert("Gagal mengirim ke database cloud: " + error.message);
            } else {
                alert("Dokumentasi kegiatan berhasil tersimpan secara online untuk semua perangkat!");
                fileInput.value = ""; 
                document.getElementById("deskripsi-foto").value = "";
                tampilkanFotoDariDatabase();
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

async function tampilkanFotoDariDatabase() {
    const gridFoto = document.getElementById("photo-grid");
    let kontenHTML = "";

    // MENGAMBIL DATA GLOBAL DARI SERVER CLOUD
    const { data: fotoTersimpan, error } = await supabase
        .from('wadah_foto_v2')
        .select('*')
        .order('id', { ascending: true });

    if(!fotoTersimpan || fotoTersimpan.length === 0) {
        kontenHTML = "<p style='color:#777; font-style:italic;'>Belum ada kiriman aksi lingkungan di database cloud.</p>";
    } else {
        fotoTersimpan.forEach((item) => {
            kontenHTML += `
                <div class="photo-item">
                    <div>
                        <img src="${item.foto}" alt="Aksi Sekolah">
                        <h4 style="color:#2e7d32; margin-bottom:5px;">Aksi Lingkungan</h4>
                        <p>${item.deskripsi}</p>
                    </div>
                    ${isAdminActive ? `<button onclick="hapusFoto(${item.id})" class="btn-hapus">🗑️ Hapus Postingan</button>` : ''}
                </div>
            `;
        });
    }
    gridFoto.innerHTML = kontenHTML;
}

async function hapusFoto(idTarget) {
    if(confirm("Apakah Anda yakin ingin menghapus dokumentasi ini dari server database cloud?")) {
        const { error } = await supabase.from('wadah_foto_v2').delete().eq('id', idTarget);
        if(!error) tampilkanFotoDariDatabase();
    }
}

// 💬 KONEKSI ONLINE: KOTAK ASPIRASI SINKRONISASI GLOBAL
async function kirimAspirasi() {
    const namaInput = document.getElementById("nama-aspirasi").value.trim() || "Anonim";
    const isiInput = document.getElementById("isi-aspirasi").value.trim();

    if(isiInput === "") {
        alert("Kotak aspirasi tidak boleh kosong!");
        return;
    }

    const waktuSekarang = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

    const { error } = await supabase
        .from('wadah_aspirasi_v2')
        .insert([{ nama: namaInput, pesan: isiInput, waktu: waktuSekarang }]);

    if (error) {
        alert("Aspirasi gagal terkirim secara online: " + error.message);
    } else {
        alert("Terima kasih! Aspirasi Anda tersimpan secara global di cloud.");
        document.getElementById("nama-aspirasi").value = "";
        document.getElementById("isi-aspirasi").value = "";
        tampilkanAspirasiDariDatabase();
    }
}

async function tampilkanAspirasiDariDatabase() {
    const wadahPesan = document.getElementById("wadah-aspirasi-masuk");
    let kontenHTML = "";

    const { data: aspirasiTersimpan, error } = await supabase
        .from('wadah_aspirasi_v2')
        .select('*')
        .order('id', { ascending: false });

    if(!aspirasiTersimpan || aspirasiTersimpan.length === 0) {
        kontenHTML = "<p style='color:#777; font-style:italic; padding: 10px;'>Belum ada aspirasi masuk di server cloud.</p>";
    } else {
        aspirasiTersimpan.forEach((item) => {
            kontenHTML += `
                <div class="item-aspirasi">
                    <h5>👤 ${item.nama}</h5>
                    <p>${item.pesan}</p>
                    <span>📅 ${item.waktu} WIB</span>
                    ${isAdminActive ? `<button onclick="hapusAspirasi(${item.id})" class="btn-hapus" style="width:auto; padding:5px 10px;">🗑️ Hapus Aspirasi SARA</button>` : ''}
                </div>
            `;
        });
    }
    wadahPesan.innerHTML = kontenHTML;
}

async function hapusAspirasi(idTarget) {
    if(confirm("Apakah Anda yakin ingin menghapus teks aspirasi ini dari server cloud?")) {
        const { error } = await supabase.from('wadah_aspirasi_v2').delete().eq('id', idTarget);
        if(!error) tampilkanAspirasiDariDatabase();
    }
}

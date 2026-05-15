const SANDI_RAHASIA = "smanggesjuara";
let isAdminActive = false; 

document.addEventListener("DOMContentLoaded", function() {
    tampilkanFotoDariWadah();
    tampilkanAspirasiDariWadah();
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
        
        tampilkanFotoDariWadah();
        tampilkanAspirasiDariWadah();
    } else {
        pesanError.style.display = "block";
    }
}

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

    const file = fileInput.files;
    const reader = new FileReader();

    reader.onload = function(e) {
        const gambarBase64 = e.target.result;
        let wadahFoto = JSON.parse(localStorage.getItem("wadah_foto_v2")) || [];
        
        const itemBaru = {
            id: Date.now(),
            foto: gambarBase64,
            deskripsi: teksInput
        };
        
        wadahFoto.push(itemBaru);
        localStorage.setItem("wadah_foto_v2", JSON.stringify(wadahFoto));
        
        alert("Dokumentasi kegiatan berhasil dipublikasikan ke galeri!");
        fileInput.value = ""; 
        document.getElementById("deskripsi-foto").value = "";
        tampilkanFotoDariWadah(); 
    };

    reader.readAsDataURL(file);
}

function tampilkanFotoDariWadah() {
    const gridFoto = document.getElementById("photo-grid");
    let kontenHTML = "";
    const fotoTersimpan = JSON.parse(localStorage.getItem("wadah_foto_v2")) || [];
    
    if(fotoTersimpan.length === 0) {
        kontenHTML = "<p style='color:#777; font-style:italic;'>Belum ada kiriman aksi lingkungan. Pengurus dapat memasukkan dokumentasi pertama di atas.</p>";
    } else {
        fotoTersimpan.forEach((item) => {
            kontenHTML += `
                <div class="photo-item">
                    <div>
                        <img src="${item.foto}" alt="Aksi Sekolah">
                        <h4 style="color:#2e7d32; margin-bottom:5px;">Aksi Lingkungan</h4>
                        <p>${item.deskripsi}</p>
                    </div>
                    ${isAdminActive ? `<button onclick="hapusFoto(${item.id})" class="btn-hapus" style="margin-top:10px;">🗑️ Hapus Postingan</button>` : ''}
                </div>
            `;
        });
    }
    gridFoto.innerHTML = kontenHTML;
}

function hapusFoto(idTarget) {
    if(confirm("Apakah Anda yakin ingin menghapus dokumentasi kegiatan ini untuk menyaring unsur SARA/pelanggaran?")) {
        let wadahFoto = JSON.parse(localStorage.getItem("wadah_foto_v2")) || [];
        wadahFoto = wadahFoto.filter(item => item.id !== idTarget);
        localStorage.setItem("wadah_foto_v2", JSON.stringify(wadahFoto));
        tampilkanFotoDariWadah();
    }
}

function kirimAspirasi() {
    const namaInput = document.getElementById("nama-aspirasi").value.trim() || "Anonim";
    const isiInput = document.getElementById("isi-aspirasi").value.trim();

    if(isiInput === "") {
        alert("Kotak aspirasi tidak boleh kosong! Tuliskan masukan Anda.");
        return;
    }

    let wadahAspirasi = JSON.parse(localStorage.getItem("wadah_aspirasi_v2")) || [];
    const waktuSekarang = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

    const aspirasiBaru = {
        id: Date.now(),
        nama: namaInput,
        pesan: isiInput,
        waktu: waktuSekarang
    };

    wadahAspirasi.unshift(aspirasiBaru); 
    localStorage.setItem("wadah_aspirasi_v2", JSON.stringify(wadahAspirasi));

    alert("Terima kasih! Aspirasi Anda telah berhasil terkirim dan ditayangkan secara langsung.");
    document.getElementById("nama-aspirasi").value = "";
    document.getElementById("isi-aspirasi").value = "";
    tampilkanAspirasiDariWadah();
}

function tampilkanAspirasiDariWadah() {
    const wadahPesan = document.getElementById("wadah-aspirasi-masuk");
    let kontenHTML = "";
    const aspirasiTersimpan = JSON.parse(localStorage.getItem("wadah_aspirasi_v2")) || [];

    if(aspirasiTersimpan.length === 0) {
        kontenHTML = "<p style='color:#777; font-style:italic; padding: 10px;'>Belum ada aspirasi masuk. Jadilah warga sekolah pertama yang memberi masukan!</p>";
    } else {
        aspirasiTersimpan.forEach((item) => {
            kontenHTML += `
                <div class="item-aspirasi">
                    <h5>👤 ${item.nama}</h5>
                    <p>${item.pesan}</p>
                    <span>📅 ${item.waktu} WIB</span>
                    ${isAdminActive ? `<button onclick="hapusAspirasi(${item.id})" class="btn-hapus" style="margin-top:12px; width:auto; padding:5px 10px;">🗑️ Hapus Aspirasi SARA</button>` : ''}
                </div>
            `;
        });
    }
    wadahPesan.innerHTML = kontenHTML;
}

// Menghapus data aspirasi bermuatan negatif
function hapusAspirasi(idTarget) {
    if(confirm("Apakah Anda yakin ingin menghapus teks aspirasi warga sekolah ini karena mengandung unsur SARA/negatif?")) {
        let wadahAspirasi = JSON.parse(localStorage.getItem("wadah_aspirasi_v2")) || [];
        wadahAspirasi = wadahAspirasi.filter(item => item.id !== idTarget);
        localStorage.setItem("wadah_aspirasi_v2", JSON.stringify(wadahAspirasi));
        tampilkanAspirasiDariWadah();
    }
}

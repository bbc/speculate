%define name my-cool-api
%define version 1.1.1_pre_release_string.1
%define release 1
%define buildroot %(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)

Name: %{name}
Version: %{version}
Release: %{release}
Summary: my-cool-api

Group: Installation Script
License: MIT
Source: %{name}.tar.gz
BuildRoot: %{buildroot}
Requires: nodejs
BuildRequires: nodejs
AutoReqProv: no

%description
My Cool API

%prep
%setup -q -c -n %{name}

%build
npm prune --production
npm rebuild

%pre
getent group my-cool-api >/dev/null || groupadd -r my-cool-api
getent passwd my-cool-api >/dev/null || useradd -r -g my-cool-api -G my-cool-api -d / -s /sbin/nologin -c "my-cool-api" my-cool-api

%install
mkdir -p %{buildroot}/usr/lib/my-cool-api
cp -r ./ %{buildroot}/usr/lib/my-cool-api
mkdir -p %{buildroot}/var/log/my-cool-api

%post
systemctl enable /usr/lib/my-cool-api/my-cool-api.service

%clean
rm -rf %{buildroot}

%files
%defattr(644, my-cool-api, my-cool-api, 755)
/usr/lib/my-cool-api
/var/log/my-cool-api
